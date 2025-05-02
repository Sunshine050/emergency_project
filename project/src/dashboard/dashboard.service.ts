import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmergencyStatus } from '../sos/dto/sos.dto';
import { DashboardStatsResponseDto, EmergencyCaseDto } from './dto/dashboard.dto';
import { NotificationGateway } from '../notification/notification.gateway';
import { CreateCaseDto } from './dto/dashboard.dto';

interface MedicalInfo {
  totalBeds?: number;
  occupiedBeds?: number;
}

interface Location {
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);

  constructor(
    private prisma: PrismaService,
    private notificationGateway: NotificationGateway,
  ) {}

  private parseLocation(location: unknown): Location {
    if (location && typeof location === 'object' && 'address' in location && 'coordinates' in location) {
      const loc = location as any;
      if (
        typeof loc.address === 'string' &&
        typeof loc.coordinates === 'object' &&
        'lat' in loc.coordinates &&
        'lng' in loc.coordinates &&
        typeof loc.coordinates.lat === 'number' &&
        typeof loc.coordinates.lng === 'number'
      ) {
        return {
          address: loc.address,
          coordinates: {
            lat: loc.coordinates.lat,
            lng: loc.coordinates.lng,
          },
        };
      }
    }
    return {
      address: 'Unknown',
      coordinates: { lat: 0, lng: 0 },
    };
  }

  private parseMedicalInfo(medicalInfo: unknown): MedicalInfo {
    if (medicalInfo && typeof medicalInfo === 'object') {
      const info = medicalInfo as any;
      return {
        totalBeds: typeof info.totalBeds === 'number' ? info.totalBeds : 0,
        occupiedBeds: typeof info.occupiedBeds === 'number' ? info.occupiedBeds : 0,
      };
    }
    return {
      totalBeds: 0,
      occupiedBeds: 0,
    };
  }

  async getStats(): Promise<DashboardStatsResponseDto> {
    const [
      totalEmergencies,
      activeEmergencies,
      completedEmergencies,
      cancelledEmergencies,
      responseTimes,
      activeTeams,
      hospitals,
      criticalCases,
    ] = await Promise.all([
      this.prisma.emergencyRequest.count(),
      this.prisma.emergencyRequest.count({
        where: {
          status: {
            in: [EmergencyStatus.PENDING, EmergencyStatus.ASSIGNED, EmergencyStatus.IN_PROGRESS],
          },
        },
      }),
      this.prisma.emergencyRequest.count({
        where: { status: EmergencyStatus.COMPLETED },
      }),
      this.prisma.emergencyRequest.count({
        where: { status: EmergencyStatus.CANCELLED },
      }),
      this.prisma.emergencyRequest.findMany({
        where: { status: EmergencyStatus.COMPLETED },
        select: {
          createdAt: true,
          updatedAt: true,
        },
      }),
      this.prisma.organization.count({
        where: {
          type: 'RESCUE_TEAM',
          status: 'ACTIVE',
        },
      }),
      this.prisma.organization.count({
        where: {
          type: 'HOSPITAL',
          status: 'ACTIVE',
        },
      }),
      this.prisma.emergencyRequest.count({
        where: { severity: 4 },
      }),
    ]);

    const totalResponseTime = responseTimes.reduce((sum, req) => {
      const created = new Date(req.createdAt).getTime();
      const updated = new Date(req.updatedAt).getTime();
      const diffInMinutes = (updated - created) / (1000 * 60);
      return sum + diffInMinutes;
    }, 0);
    const averageResponseTime = responseTimes.length ? totalResponseTime / responseTimes.length : 0;

    const hospitalDetails = await this.prisma.organization.findMany({
      where: { type: 'HOSPITAL', status: 'ACTIVE' },
      select: { medicalInfo: true },
    });
    const availableHospitalBeds = hospitalDetails.reduce((sum, hospital) => {
      const medicalInfo = this.parseMedicalInfo(hospital.medicalInfo);
      return sum + (medicalInfo.totalBeds - medicalInfo.occupiedBeds);
    }, 0);

    return {
      totalEmergencies,
      activeEmergencies,
      completedEmergencies,
      cancelledEmergencies,
      averageResponseTime: Math.round(averageResponseTime),
      activeTeams,
      availableHospitalBeds,
      connectedHospitals: hospitals,
      criticalCases,
    };
  }

  async getActiveEmergencies(): Promise<EmergencyCaseDto[]> {
    const emergencies = await this.prisma.emergencyRequest.findMany({
      where: {
        status: {
          in: [EmergencyStatus.PENDING, EmergencyStatus.ASSIGNED, EmergencyStatus.IN_PROGRESS],
        },
      },
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
        responses: {
          include: {
            organization: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return emergencies.map((emergency) => ({
      id: emergency.id,
      title: emergency.title || `Emergency ${emergency.id}`,
      status: emergency.status,
      severity: emergency.severity || 1,
      reportedAt: emergency.createdAt?.toISOString() ?? new Date().toISOString(),
      patientName: `${emergency.patient?.firstName || ''} ${emergency.patient?.lastName || ''}`.trim() || 'Unknown',
      contactNumber: emergency.patient?.phone || 'N/A',
      emergencyType: emergency.emergencyType || 'Unknown',
      location: this.parseLocation(emergency.location),
      assignedTo: emergency.responses?.[0]?.organization?.name || undefined,
      description: emergency.description || 'No description provided',
      symptoms: emergency.symptoms || [],
    }));
  }

  async getTeamLocations() {
    const teams = await this.prisma.organization.findMany({
      where: {
        type: 'RESCUE_TEAM',
        status: 'ACTIVE',
      },
      select: {
        id: true,
        name: true,
        latitude: true,
        longitude: true,
        location: true,
        status: true,
        medicalInfo: true,
      },
    });

    return teams.map((team) => ({
      id: team.id,
      name: team.name,
      type: 'RESCUE_TEAM',
      location: team.location
        ? this.parseLocation(team.location)
        : {
            address: 'Unknown',
            coordinates: {
              lat: team.latitude || 0,
              lng: team.longitude || 0,
            },
          },
      status: team.status || 'AVAILABLE',
    }));
  }

  async getHospitalCapacities() {
    const hospitals = await this.prisma.organization.findMany({
      where: {
        type: 'HOSPITAL',
        status: 'ACTIVE',
      },
      select: {
        id: true,
        name: true,
        medicalInfo: true,
        latitude: true,
        longitude: true,
        location: true,
      },
    });

    return hospitals.map((hospital) => {
      const medicalInfo = this.parseMedicalInfo(hospital.medicalInfo);
      return {
        id: hospital.id,
        name: hospital.name,
        type: 'HOSPITAL',
        capacity: medicalInfo.totalBeds,
        availableBeds: medicalInfo.totalBeds - medicalInfo.occupiedBeds,
        location: hospital.location
          ? this.parseLocation(hospital.location)
          : {
              address: 'Unknown',
              coordinates: {
                lat: hospital.latitude || 0,
                lng: hospital.longitude || 0,
              },
            },
      };
    });
  }

  async assignCase(caseId: string, assignedToId: string): Promise<EmergencyCaseDto> {
    const emergency = await this.prisma.emergencyRequest.findUnique({
      where: { id: caseId },
      include: { responses: true },
    });

    if (!emergency) {
      throw new NotFoundException(`Emergency case with ID ${caseId} not found`);
    }

    const organization = await this.prisma.organization.findUnique({
      where: { id: assignedToId },
      include: { users: true },
    });

    if (!organization || !['HOSPITAL', 'RESCUE_TEAM'].includes(organization.type)) {
      throw new NotFoundException(`Organization with ID ${assignedToId} not found or invalid type`);
    }

    const updatedEmergency = await this.prisma.emergencyRequest.update({
      where: { id: caseId },
      data: {
        status: EmergencyStatus.ASSIGNED,
        responses: {
          create: {
            organizationId: assignedToId,
            status: 'ASSIGNED',
            assignedAt: new Date(),
          },
        },
        notifications: {
          create: {
            userId: organization.users?.[0]?.id || '',
            type: 'CASE_ASSIGNED',
            title: `New Case Assigned: ${emergency.title || emergency.id}`,
            body: `You have been assigned to handle emergency case ${emergency.id}.`,
            metadata: { caseId: emergency.id },
          },
        },
      },
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
        responses: {
          include: {
            organization: true,
          },
        },
      },
    });

    const payload = {
      emergencyId: updatedEmergency.id,
      status: updatedEmergency.status,
      assignedTo: assignedToId,
    };
    this.logger.log(`Assign case ${caseId} to ${assignedToId}, broadcasting status update: ${JSON.stringify(payload)}`);
    this.notificationGateway.broadcastStatusUpdate(payload);

    return {
      id: updatedEmergency.id,
      title: updatedEmergency.title || `Emergency ${updatedEmergency.id}`,
      status: updatedEmergency.status,
      severity: updatedEmergency.severity || 1,
      reportedAt: updatedEmergency.createdAt?.toISOString() ?? new Date().toISOString(),
      patientName: `${updatedEmergency.patient?.firstName || ''} ${updatedEmergency.patient?.lastName || ''}`.trim() || 'Unknown',
      contactNumber: updatedEmergency.patient?.phone || 'N/A',
      emergencyType: updatedEmergency.emergencyType || 'Unknown',
      location: this.parseLocation(updatedEmergency.location),
      assignedTo: updatedEmergency.responses?.[0]?.organization?.name || undefined,
      description: updatedEmergency.description || 'No description provided',
      symptoms: updatedEmergency.symptoms || [],
    };
  }

  async cancelCase(caseId: string): Promise<EmergencyCaseDto> {
    const emergency = await this.prisma.emergencyRequest.findUnique({
      where: { id: caseId },
      include: {
        responses: {
          include: {
            organization: {
              include: {
                users: true,
              },
            },
          },
        },
      },
    });

    if (!emergency) {
      throw new NotFoundException(`Emergency case with ID ${caseId} not found`);
    }

    const updatedEmergency = await this.prisma.emergencyRequest.update({
      where: { id: caseId },
      data: {
        status: EmergencyStatus.CANCELLED,
        notifications: {
          create: emergency.responses.map((response) => ({
            userId: response.organization?.users?.[0]?.id || '',
            type: 'CASE_CANCELLED',
            title: `Case Cancelled: ${emergency.title || emergency.id}`,
            body: `Emergency case ${emergency.id} has been cancelled.`,
            metadata: { caseId: emergency.id },
          })),
        },
      },
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
        responses: {
          include: {
            organization: true,
          },
        },
      },
    });

    const payload = {
      emergencyId: updatedEmergency.id,
      status: updatedEmergency.status,
      assignedTo: emergency.responses?.[0]?.organizationId || undefined,
    };
    this.logger.log(`Cancel case ${caseId}, broadcasting status update: ${JSON.stringify(payload)}`);
    this.notificationGateway.broadcastStatusUpdate(payload);

    return {
      id: updatedEmergency.id,
      title: updatedEmergency.title || `Emergency ${updatedEmergency.id}`,
      status: updatedEmergency.status,
      severity: updatedEmergency.severity || 1,
      reportedAt: updatedEmergency.createdAt?.toISOString() ?? new Date().toISOString(),
      patientName: `${updatedEmergency.patient?.firstName || ''} ${updatedEmergency.patient?.lastName || ''}`.trim() || 'Unknown',
      contactNumber: updatedEmergency.patient?.phone || 'N/A',
      emergencyType: updatedEmergency.emergencyType || 'Unknown',
      location: this.parseLocation(updatedEmergency.location),
      assignedTo: updatedEmergency.responses?.[0]?.organization?.name || undefined,
      description: updatedEmergency.description || 'No description provided',
      symptoms: updatedEmergency.symptoms || [],
    };
  }

  async createCase(createCaseDto: CreateCaseDto): Promise<EmergencyCaseDto> {
    const { title, patientName, contactNumber, emergencyType, locationAddress, description, severity } = createCaseDto;

    const newEmergency = await this.prisma.emergencyRequest.create({
      data: {
        title,
        status: EmergencyStatus.PENDING,
        severity,
        emergencyType,
        description,
        symptoms: [], // เริ่มต้นเป็น array ว่าง
        location: {
          address: locationAddress,
          coordinates: { lat: 0, lng: 0 }, // ต้องเพิ่ม logic หาค่า lat/lng จริงในอนาคต
        },
        latitude: 0, // เก็บสำเนาค่า
        longitude: 0, // เก็บสำเนาค่า
        patient: {
          create: {
            email: `${patientName.toLowerCase().replace(/\s/g, '.')}-emergency@example.com`, // สร้าง email ชั่วคราว
            firstName: patientName.split(" ")[0] || "Unknown",
            lastName: patientName.split(" ")[1] || "",
            phone: contactNumber || "N/A",
            role: "PATIENT", // ตั้งค่า role ตาม default
            status: "ACTIVE",
          },
        },
      },
      include: {
        patient: { select: { id: true, firstName: true, lastName: true, phone: true } },
        responses: { include: { organization: true } },
      },
    });

    // สร้างการแจ้งเตือนและส่งผ่าน WebSocket
    const notification = {
      id: `notif-${new Date().getTime()}`,
      title: `New Case Created: ${title}`,
      description: `A new ${emergencyType} case has been reported by ${patientName}.`,
      timestamp: new Date().toISOString(),
      read: false,
    };
    this.notificationGateway.server.emit("notification", notification); // ส่งไปทุก client
    this.notificationGateway.broadcastEmergency({
      id: newEmergency.id,
      type: emergencyType,
      grade: severity === 4 ? "CRITICAL" : severity === 3 ? "URGENT" : "NORMAL",
      location: { address: locationAddress },
      coordinates: { latitude: 0, longitude: 0 }, // ต้องเพิ่ม logic หาค่า lat/lng
    });

    return {
      id: newEmergency.id,
      title: newEmergency.title || `Emergency ${newEmergency.id}`,
      status: newEmergency.status,
      severity: newEmergency.severity || 1,
      reportedAt: newEmergency.createdAt?.toISOString() ?? new Date().toISOString(),
      patientName: `${newEmergency.patient?.firstName || ""} ${newEmergency.patient?.lastName || ""}`.trim() || "Unknown",
      contactNumber: newEmergency.patient?.phone || "N/A",
      emergencyType: newEmergency.emergencyType || "Unknown",
      location: this.parseLocation(newEmergency.location),
      assignedTo: undefined,
      description: newEmergency.description || "No description provided",
      symptoms: newEmergency.symptoms || [],
    };
  }
}