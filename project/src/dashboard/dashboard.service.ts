import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmergencyStatus } from '../sos/dto/sos.dto';
import { AssignCaseDto, CancelCaseDto } from './dto/dashboard.dto';

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
      this.prisma.emergencyRequest.count(),
      this.prisma.emergencyRequest.count({
        where: {
          status: {
            in: [
              EmergencyStatus.PENDING,
              EmergencyStatus.ASSIGNED,
              EmergencyStatus.IN_PROGRESS,
            ],
          },
        },
      }),
      this.prisma.emergencyRequest.count({
        where: { status: EmergencyStatus.COMPLETED },
      }),
      this.prisma.organization.count({
        where: { type: 'RESCUE_TEAM', status: 'ACTIVE' },
      }),
      this.prisma.organization.count({
        where: { type: 'HOSPITAL', status: 'ACTIVE' },
      }),
    ]);

    return {
      totalEmergencies,
      activeEmergencies,
      completedEmergencies,
      activeTeams,
      connectedHospitals: hospitals,
      criticalCases: await this.prisma.emergencyRequest.count({
        where: { medicalInfo: { path: ['severity'], equals: 4 } }, // สมมติว่า severity อยู่ใน medicalInfo
      }),
      averageResponseTime: 0, // คำนวณจากข้อมูลจริง
      availableHospitalBeds: 0, // ดึงจาก medicalInfo ของโรงพยาบาล
      cancelledEmergencies: await this.prisma.emergencyRequest.count({
        where: { status: EmergencyStatus.CANCELLED },
      }),
    };
  }

  async getActiveEmergencies() {
    return this.prisma.emergencyRequest.findMany({
      where: {
        status: {
          in: [
            EmergencyStatus.PENDING,
            EmergencyStatus.ASSIGNED,
            EmergencyStatus.IN_PROGRESS,
          ],
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
      orderBy: { createdAt: 'desc' },
    });
  }

  async getTeamLocations() {
    return this.prisma.organization.findMany({
      where: { type: 'RESCUE_TEAM', status: 'ACTIVE' },
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
      where: { type: 'HOSPITAL', status: 'ACTIVE' },
      select: {
        id: true,
        name: true,
        medicalInfo: true,
      },
    });
  }

  async assignCase(dto: AssignCaseDto) {
    const { caseId, assignedToId } = dto;
    const emergency = await this.prisma.emergencyRequest.findUnique({
      where: { id: caseId },
    });

    if (!emergency) {
      throw new NotFoundException('Emergency case not found');
    }

    await this.prisma.emergencyResponse.create({
      data: {
        emergencyRequestId: caseId,
        organizationId: assignedToId,
        status: 'ASSIGNED',
        dispatchTime: new Date(),
      },
    });

    return this.prisma.emergencyRequest.update({
      where: { id: caseId },
      data: { status: EmergencyStatus.ASSIGNED },
    });
  }

  async cancelCase(dto: CancelCaseDto) {
    const { caseId } = dto;
    const emergency = await this.prisma.emergencyRequest.findUnique({
      where: { id: caseId },
    });

    if (!emergency) {
      throw new NotFoundException('Emergency case not found');
    }

    return this.prisma.emergencyRequest.update({
      where: { id: caseId },
      data: { status: EmergencyStatus.CANCELLED },
    });
  }
}