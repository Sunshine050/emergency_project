import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { NotificationService } from "../notification/notification.service";
import { NotificationGateway } from "../notification/notification.gateway";
import {
  CreateEmergencyRequestDto,
  UpdateEmergencyStatusDto,
  EmergencyStatus,
  BroadcastStatusUpdateDto,
} from "./dto/sos.dto";
import { UserRole } from "@prisma/client";

@Injectable()
export class SosService {
  constructor(
    private prisma: PrismaService,
    private notificationService: NotificationService,
    private notificationGateway: NotificationGateway,
  ) {}

  async createEmergencyRequest(
    createSosDto: CreateEmergencyRequestDto,
    userId: string,
  ) {
    const patientId = createSosDto.patientId || userId;
    console.log("Creating emergency with type:", createSosDto.type, "for patientId:", patientId);

    const medicalInfo = {
      ...(createSosDto.medicalInfo || {}),
      grade: createSosDto.grade,
      severity: createSosDto.grade === "CRITICAL" ? 5 : createSosDto.grade === "URGENT" ? 3 : 1,
      emergencyType: createSosDto.type, // เพิ่ม emergencyType ใน medicalInfo
    };

    const emergencyRequest = await this.prisma.emergencyRequest.create({
      data: {
        status: EmergencyStatus.PENDING,
        type: createSosDto.type,
        description: createSosDto.description,
        location: createSosDto.location,
        latitude: createSosDto.latitude,
        longitude: createSosDto.longitude,
        medicalInfo,
        patientId,
      },
      include: {
        patient: true,
      },
    });

    const responders = await this.prisma.user.findMany({
      where: {
        role: {
          in: [
            UserRole.EMERGENCY_CENTER,
            UserRole.HOSPITAL,
            UserRole.RESCUE_TEAM
          ],
        },
        status: "ACTIVE",
      },
    });

    for (const responder of responders) {
      await this.notificationService.createNotification({
        type: "EMERGENCY",
        title: "New Emergency Request",
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

    return emergencyRequest;
  }

  async assignToHospital(emergencyId: string, hospitalId: string, userId: string) {
    const updatedEmergency = await this.prisma.$transaction(async (prisma) => {
      const emergency = await prisma.emergencyRequest.findUnique({
        where: { id: emergencyId },
        include: {
          patient: true,
          responses: {
            include: {
              organization: true,
            },
          },
        },
      });

      if (!emergency) {
        throw new NotFoundException("Emergency request not found");
      }

      if (emergency.status !== EmergencyStatus.PENDING) {
        throw new NotFoundException("Only PENDING cases can be assigned");
      }

      const updated = await prisma.emergencyRequest.update({
        where: { id: emergencyId },
        data: {
          status: EmergencyStatus.ASSIGNED,
          updatedBy: userId,
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

      await prisma.emergencyResponse.create({
        data: {
          emergencyRequestId: emergencyId,
          organizationId: hospitalId,
          status: "ASSIGNED",
          createdAt: new Date(),
        },
      });

      const hospitalUsers = await prisma.user.findMany({
        where: {
          organizationId: hospitalId,
          role: UserRole.HOSPITAL,
          status: "ACTIVE",
        },
      });

      for (const user of hospitalUsers) {
        await this.notificationService.createNotification({
          type: "ASSIGNMENT",
          title: "New Emergency Assignment",
          body: `You have been assigned to emergency case ${emergencyId} (${emergency.type})`,
          userId: user.id,
          metadata: {
            emergencyId: emergencyId,
            status: EmergencyStatus.ASSIGNED,
            patientName: `${emergency.patient.firstName} ${emergency.patient.lastName}`,
          },
        });
      }

      await this.notificationService.createNotification({
        type: "STATUS_UPDATE",
        title: "Emergency Status Update",
        body: `Your emergency request has been assigned to a hospital`,
        userId: emergency.patientId,
        metadata: {
          emergencyId: emergencyId,
          status: EmergencyStatus.ASSIGNED,
        },
      });

      return updated;
    });

    this.notificationGateway.broadcastStatusUpdate({
      emergencyId: updatedEmergency.id,
      status: updatedEmergency.status,
    });

    return updatedEmergency;
  }

  async updateStatus(id: string, updateStatusDto: UpdateEmergencyStatusDto) {
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
        throw new NotFoundException("Emergency request not found");
      }

      console.log("Before update - Emergency:", emergency);

      const updated = await prisma.emergencyRequest.update({
        where: { id },
        data: {
          status: updateStatusDto.status,
        },
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

      console.log("After update - Updated emergency:", updated);

      await this.notificationService.createNotification({
        type: "STATUS_UPDATE",
        title: "Emergency Status Update",
        body: `Your emergency request status has been updated to ${updateStatusDto.status}`,
        userId: emergency.patientId,
        metadata: {
          emergencyId: emergency.id,
          status: updateStatusDto.status,
          notes: updateStatusDto.notes,
        },
      });

      for (const response of emergency.responses) {
        for (const user of response.organization.users) {
          await this.notificationService.createNotification({
            type: "STATUS_UPDATE",
            title: "Emergency Status Update",
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
    });

    return updatedEmergency;
  }

  async getEmergencyRequests(userId: string) {
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
      throw new NotFoundException("No emergency requests found for this user");
    }

    return emergencyRequests.map((request) => ({
      ...request,
      emergencyType: request.type,
      medicalInfo: request.medicalInfo || { grade: "NON_URGENT", severity: 1 },
    }));
  }

  async getEmergencyRequestById(id: string, userId: string) {
    const emergencyRequest = await this.prisma.emergencyRequest.findUnique({
      where: { id },
      select: {
        id: true,
        status: true,
        type: true,
        description: true,
        location: true,
        latitude: true,
        longitude: true,
        medicalInfo: true,
        patientId: true,
        patient: true,
        responses: {
          include: {
            organization: true,
          },
        },
      },
    });

    console.log("Fetched emergency request:", emergencyRequest);

    if (!emergencyRequest) {
      throw new NotFoundException("Emergency request not found");
    }

    if (emergencyRequest.patientId !== userId) {
      throw new NotFoundException("Emergency request not found");
    }

    return {
      ...emergencyRequest,
          emergencyType: emergencyRequest.type,
      medicalInfo: emergencyRequest.medicalInfo || { grade: "NON_URGENT", severity: 1 },
    };
  }

  async getAllEmergencyRequests() {
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

    if (!emergencyRequests || emergencyRequests.length === 0) {
      throw new NotFoundException("No emergency requests found");
    }

    return emergencyRequests.map((request) => ({
      ...request,
      emergencyType: request.type,
      medicalInfo: request.medicalInfo || { grade: "NON_URGENT", severity: 1 },
    }));
  }

  async findActiveEmergenciesByHospital(hospitalId: string) {
    const emergencyRequests = await this.prisma.emergencyRequest.findMany({
      where: {
        responses: {
          some: {
            organizationId: hospitalId,
            status: {
              in: ["ASSIGNED", "IN_PROGRESS"],
            },
          },
        },
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

    return emergencyRequests.map((request) => ({
      ...request,
      emergencyType: request.type,
      medicalInfo: request.medicalInfo || { grade: "NON_URGENT", severity: 1 },
    }));
  }
}