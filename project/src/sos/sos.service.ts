import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationService } from '../notification/notification.service';
import { NotificationGateway } from '../notification/notification.gateway';
import {
  CreateEmergencyRequestDto,
  UpdateEmergencyStatusDto,
  EmergencyStatus,
  EmergencyResponseDto,
} from './dto/sos.dto';
import { UserRole } from '@prisma/client';

interface Location {
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

@Injectable()
export class SosService {
  constructor(
    private prisma: PrismaService,
    private notificationService: NotificationService,
    private notificationGateway: NotificationGateway,
  ) {}

  private calculateSeverity(grade: string): number {
    switch (grade) {
      case 'CRITICAL':
        return 4;
      case 'URGENT':
        return 3;
      case 'NON_URGENT':
        return 1;
      default:
        return 1;
    }
  }

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

  async createEmergencyRequest(
    createSosDto: CreateEmergencyRequestDto,
    userId: string,
  ): Promise<EmergencyResponseDto> {
    const severity = this.calculateSeverity(createSosDto.grade);

    const emergencyRequest = await this.prisma.emergencyRequest.create({
      data: {
        title: createSosDto.description.substring(0, 50),
        status: EmergencyStatus.PENDING,
        severity,
        emergencyType: createSosDto.type,
        description: createSosDto.description,
        symptoms: createSosDto.symptoms || [],
        location: {
          address: createSosDto.location || 'Unknown',
          coordinates: {
            lat: createSosDto.latitude || 0,
            lng: createSosDto.longitude || 0,
          },
        },
        latitude: createSosDto.latitude,
        longitude: createSosDto.longitude,
        medicalInfo: {
          ...createSosDto.medicalInfo,
          grade: createSosDto.grade,
          type: createSosDto.type,
        },
        patientId: userId,
      },
      include: {
        patient: true,
      },
    });

    const responders = await this.prisma.user.findMany({
      where: {
        role: {
          in: [UserRole.EMERGENCY_CENTER, UserRole.HOSPITAL, UserRole.RESCUE_TEAM],
        },
        status: 'ACTIVE',
      },
    });

    for (const responder of responders) {
      await this.notificationService.createNotification({
        type: 'EMERGENCY',
        title: 'New Emergency Request',
        body: `Emergency ${createSosDto.type} - ${createSosDto.grade} grade`,
        userId: responder.id,
        metadata: {
          emergencyId: emergencyRequest.id,
          grade: createSosDto.grade,
          type: createSosDto.type,
          location: emergencyRequest.location,
          patientName: `${emergencyRequest.patient.firstName} ${emergencyRequest.patient.lastName}`,
        },
      });
    }

    this.notificationGateway.broadcastEmergency({
      id: emergencyRequest.id,
      type: createSosDto.type,
      grade: createSosDto.grade,
      location: emergencyRequest.location,
      coordinates: {
        latitude: emergencyRequest.latitude,
        longitude: emergencyRequest.longitude,
      },
    });

    return {
      id: emergencyRequest.id,
      title: emergencyRequest.title || `Emergency ${emergencyRequest.id}`,
      status: emergencyRequest.status,
      severity: emergencyRequest.severity || 1,
      reportedAt: emergencyRequest.createdAt?.toISOString() ?? new Date().toISOString(),
      patientName: `${emergencyRequest.patient.firstName} ${emergencyRequest.patient.lastName}`.trim(),
      contactNumber: emergencyRequest.patient.phone || 'N/A',
      emergencyType: emergencyRequest.emergencyType || 'Unknown',
      location: this.parseLocation(emergencyRequest.location),
      description: emergencyRequest.description,
      symptoms: emergencyRequest.symptoms || [],
    };
  }

  async updateStatus(
    id: string,
    updateStatusDto: UpdateEmergencyStatusDto,
  ): Promise<EmergencyResponseDto> {
    const updatedEmergency = await this.prisma.$transaction(async (prisma) => {
      const emergency = await prisma.emergencyRequest.findUnique({
        where: { id },
        include: {
          patient: true,
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
        throw new NotFoundException('Emergency request not found');
      }

      let additionalData: any = { status: updateStatusDto.status };
      if (updateStatusDto.status === EmergencyStatus.ASSIGNED && updateStatusDto.assignedToId) {
        additionalData.responses = {
          create: {
            organizationId: updateStatusDto.assignedToId,
            status: 'ASSIGNED',
            assignedAt: new Date(),
          },
        };
      }

      const updated = await prisma.emergencyRequest.update({
        where: { id },
        data: additionalData,
        include: {
          patient: true,
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

      await this.notificationService.createNotification({
        type: 'STATUS_UPDATE',
        title: 'Emergency Status Update',
        body: `Your emergency request status has been updated to ${updateStatusDto.status}`,
        userId: emergency.patientId,
        metadata: {
          emergencyId: emergency.id,
          status: updateStatusDto.status,
          notes: updateStatusDto.notes,
        },
      });

      for (const response of updated.responses) {
        for (const user of response.organization.users) {
          await this.notificationService.createNotification({
            type: 'STATUS_UPDATE',
            title: 'Emergency Status Update',
            body: `Emergency request ${emergency.id} status updated to ${updateStatusDto.status}`,
            userId: user.id,
            metadata: {
              emergencyId: emergency.id,
              status: updateStatusDto.status,
              notes: updateStatusDto.notes,
            },
          });
        }
      }

      return updated;
    });

    this.notificationGateway.broadcastStatusUpdate({
      emergencyId: updatedEmergency.id,
      status: updatedEmergency.status,
      notes: updateStatusDto.notes,
    });

    return {
      id: updatedEmergency.id,
      title: updatedEmergency.title || `Emergency ${updatedEmergency.id}`,
      status: updatedEmergency.status,
      severity: updatedEmergency.severity || 1,
      reportedAt: updatedEmergency.createdAt?.toISOString() ?? new Date().toISOString(),
      patientName: `${updatedEmergency.patient.firstName} ${updatedEmergency.patient.lastName}`.trim(),
      contactNumber: updatedEmergency.patient.phone || 'N/A',
      emergencyType: updatedEmergency.emergencyType || 'Unknown',
      location: this.parseLocation(updatedEmergency.location),
      description: updatedEmergency.description,
      symptoms: updatedEmergency.symptoms || [],
      assignedTo: updatedEmergency.responses?.[0]?.organization?.name,
    };
  }

  async getEmergencyRequests(userId: string): Promise<EmergencyResponseDto[]> {
    const emergencyRequests = await this.prisma.emergencyRequest.findMany({
      where: {
        patientId: userId,
      },
      include: {
        patient: true,
        responses: {
          include: {
            organization: true,
          },
        },
      },
    });

    if (!emergencyRequests || emergencyRequests.length === 0) {
      throw new NotFoundException('No emergency requests found for this user');
    }

    return emergencyRequests.map((emergency) => ({
      id: emergency.id,
      title: emergency.title || `Emergency ${emergency.id}`,
      status: emergency.status,
      severity: emergency.severity || 1,
      reportedAt: emergency.createdAt?.toISOString() ?? new Date().toISOString(),
      patientName: `${emergency.patient.firstName} ${emergency.patient.lastName}`.trim(),
      contactNumber: emergency.patient.phone || 'N/A',
      emergencyType: emergency.emergencyType || 'Unknown',
      location: this.parseLocation(emergency.location),
      description: emergency.description,
      symptoms: emergency.symptoms || [],
      assignedTo: emergency.responses?.[0]?.organization?.name,
    }));
  }

  async getEmergencyRequestById(id: string, userId: string): Promise<EmergencyResponseDto> {
    const emergencyRequest = await this.prisma.emergencyRequest.findUnique({
      where: { id },
      include: {
        patient: true,
        responses: {
          include: {
            organization: true,
          },
        },
      },
    });

    if (!emergencyRequest) {
      throw new NotFoundException('Emergency request not found');
    }

    if (emergencyRequest.patientId !== userId) {
      throw new NotFoundException('Emergency request not found');
    }

    return {
      id: emergencyRequest.id,
      title: emergencyRequest.title || `Emergency ${emergencyRequest.id}`,
      status: emergencyRequest.status,
      severity: emergencyRequest.severity || 1,
      reportedAt: emergencyRequest.createdAt?.toISOString() ?? new Date().toISOString(),
      patientName: `${emergencyRequest.patient.firstName} ${emergencyRequest.patient.lastName}`.trim(),
      contactNumber: emergencyRequest.patient.phone || 'N/A',
      emergencyType: emergencyRequest.emergencyType || 'Unknown',
      location: this.parseLocation(emergencyRequest.location),
      description: emergencyRequest.description,
      symptoms: emergencyRequest.symptoms || [],
      assignedTo: emergencyRequest.responses?.[0]?.organization?.name,
    };
  }

  async getAllEmergencyRequests(): Promise<EmergencyResponseDto[]> {
    const emergencyRequests = await this.prisma.emergencyRequest.findMany({
      include: {
        patient: true,
        responses: {
          include: {
            organization: true,
          },
        },
      },
    });

    return emergencyRequests.map((emergency) => ({
      id: emergency.id,
      title: emergency.title || `Emergency ${emergency.id}`,
      status: emergency.status,
      severity: emergency.severity || 1,
      reportedAt: emergency.createdAt?.toISOString() ?? new Date().toISOString(),
      patientName: `${emergency.patient.firstName} ${emergency.patient.lastName}`.trim(),
      contactNumber: emergency.patient.phone || 'N/A',
      emergencyType: emergency.emergencyType || 'Unknown',
      location: this.parseLocation(emergency.location),
      description: emergency.description || 'No description provided',
      symptoms: emergency.symptoms || [],
      assignedTo: emergency.responses?.[0]?.organization?.name,
    }));
  }
}