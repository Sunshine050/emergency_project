import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmergencyStatus } from '../sos/dto/sos.dto';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getStats() {
    const [
      totalEmergencies,
      activeEmergencies,
      completedEmergencies,
      activeTeams,
      hospitals,
    ] = await Promise.all([
      // Total emergencies
      this.prisma.emergencyRequest.count(),
      // Active emergencies
      this.prisma.emergencyRequest.count({
        where: {
          status: {
            in: [EmergencyStatus.PENDING, EmergencyStatus.ASSIGNED, EmergencyStatus.IN_PROGRESS],
          },
        },
      }),
      // Completed emergencies
      this.prisma.emergencyRequest.count({
        where: {
          status: EmergencyStatus.COMPLETED,
        },
      }),
      // Active rescue teams
      this.prisma.organization.count({
        where: {
          type: 'RESCUE_TEAM',
          status: 'ACTIVE',
        },
      }),
      // Active hospitals
      this.prisma.organization.count({
        where: {
          type: 'HOSPITAL',
          status: 'ACTIVE',
        },
      }),
    ]);

    return {
      totalEmergencies,
      activeEmergencies,
      completedEmergencies,
      activeTeams,
      hospitals,
    };
  }

  async getActiveEmergencies() {
    return this.prisma.emergencyRequest.findMany({
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
  }

  async getTeamLocations() {
    return this.prisma.organization.findMany({
      where: {
        type: 'RESCUE_TEAM',
        status: 'ACTIVE',
      },
      select: {
        id: true,
        name: true,
        latitude: true,
        longitude: true,
        status: true,
        medicalInfo: true,
      },
    });
  }

  async getHospitalCapacities() {
    return this.prisma.organization.findMany({
      where: {
        type: 'HOSPITAL',
        status: 'ACTIVE',
      },
      select: {
        id: true,
        name: true,
        medicalInfo: true,
      },
    });
  }
}