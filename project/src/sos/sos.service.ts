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
    const patientId = createSosDto.patientId || userId; // ใช้ patientId จาก DTO ถ้ามี
    console.log("Creating emergency with type:", createSosDto.type, "for patientId:", patientId);

    const emergencyRequest = await this.prisma.emergencyRequest.create({
      data: {
        status: EmergencyStatus.PENDING,
        type: createSosDto.type,
        description: createSosDto.description,
        location: createSosDto.location,
        latitude: createSosDto.latitude,
        longitude: createSosDto.longitude,
        medicalInfo: {
          ...createSosDto.medicalInfo,
          grade: createSosDto.grade,
        },
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

    return emergencyRequests;
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

    return emergencyRequest;
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

    return emergencyRequests;
  }
}