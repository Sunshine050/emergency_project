import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { NotificationService } from "../notification/notification.service";
import { NotificationGateway } from "../notification/notification.gateway";
import {
  CreateEmergencyRequestDto,
  UpdateEmergencyStatusDto,
  EmergencyStatus,
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
    // Create emergency request
    const emergencyRequest = await this.prisma.emergencyRequest.create({
      data: {
        status: EmergencyStatus.PENDING,
        description: createSosDto.description,
        location: createSosDto.location,
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

    // Find emergency centers, hospitals, and rescue teams
    const responders = await this.prisma.user.findMany({
      where: {
        role: {
          in: [
            UserRole.EMERGENCY_CENTER,
            UserRole.HOSPITAL,
            UserRole.RESCUE_TEAM,
          ],
        },
        status: "ACTIVE",
      },
    });

    // Send notifications to all responders
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

    // Broadcast emergency to all responders via WebSocket
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
    const emergency = await this.prisma.emergencyRequest.findUnique({
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

    // Update emergency status
    const updatedEmergency = await this.prisma.emergencyRequest.update({
      where: { id },
      data: {
        status: updateStatusDto.status,
      },
    });

    // Notify patient
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

    // Notify all involved organizations
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

    // Broadcast status update via WebSocket
    this.notificationGateway.broadcastStatusUpdate({
      emergencyId: emergency.id,
      status: updateStatusDto.status,
      notes: updateStatusDto.notes,
    });

    return updatedEmergency;
  }
}
