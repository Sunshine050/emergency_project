import { Injectable, NotFoundException, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmergencyStatus } from '../sos/dto/sos.dto';
import { AssignCaseDto, CancelCaseDto } from './dto/dashboard.dto';
import { NotificationGateway } from '../notification/notification.gateway';

interface HospitalMedicalInfo {
  availableBeds?: number;
}

interface OrganizationWithMedicalInfo {
  id: string;
  name: string;
  medicalInfo?: HospitalMedicalInfo;
}

@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);

  constructor(
    private prisma: PrismaService,
    private notificationGateway: NotificationGateway, // Inject NotificationGateway
  ) {}

  async getStats() {
    this.logger.log('Fetching dashboard statistics');

    try {
      const [
        totalEmergencies,
        activeEmergencies,
        completedEmergencies,
        activeTeams,
        hospitals,
        criticalCases,
        cancelledEmergencies,
        responseTimes,
        hospitalCapacities,
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
        this.prisma.emergencyRequest.count({
          where: { medicalInfo: { path: ['severity'], equals: 4 } },
        }),
        this.prisma.emergencyRequest.count({
          where: { status: EmergencyStatus.CANCELLED },
        }),
        this.prisma.emergencyResponse.findMany({
          where: { status: 'COMPLETED' },
          select: {
            dispatchTime: true,
            completionTime: true,
          },
        }),
        this.prisma.organization.findMany({
          where: { type: 'HOSPITAL', status: 'ACTIVE' },
          select: {
            id: true,
            name: true,
            medicalInfo: true,
          },
        }),
      ]);

      let averageResponseTime = 0;
      if (responseTimes.length > 0) {
        const totalResponseTime = responseTimes.reduce((sum, response) => {
          if (response.dispatchTime && response.completionTime) {
            const diffMs =
              new Date(response.completionTime).getTime() -
              new Date(response.dispatchTime).getTime();
            return sum + diffMs / (1000 * 60);
          }
          return sum;
        }, 0);
        averageResponseTime = totalResponseTime / responseTimes.length;
      }

      let availableHospitalBeds = 0;
      (hospitalCapacities as OrganizationWithMedicalInfo[]).forEach((hospital) => {
        if (hospital.medicalInfo && typeof (hospital.medicalInfo as HospitalMedicalInfo).availableBeds === 'number') {
          availableHospitalBeds += (hospital.medicalInfo as HospitalMedicalInfo).availableBeds;
        }
      });

      const stats = {
        totalEmergencies,
        activeEmergencies,
        completedEmergencies,
        activeTeams,
        connectedHospitals: hospitals,
        criticalCases,
        averageResponseTime: Number(averageResponseTime.toFixed(2)),
        availableHospitalBeds,
        cancelledEmergencies,
      };

      this.logger.log(`Dashboard stats fetched: ${JSON.stringify(stats)}`);
      return stats;
    } catch (error) {
      this.logger.error(`Failed to fetch dashboard stats: ${error.message}`, error.stack);
      throw new Error(`Cannot fetch dashboard stats: ${error.message}`);
    }
  }

  async getActiveEmergencies() {
    this.logger.log('Fetching active emergencies');

    try {
      const emergencies = await this.prisma.emergencyRequest.findMany({
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

      this.logger.log(`Found ${emergencies.length} active emergencies`);
      return emergencies;
    } catch (error) {
      this.logger.error(`Failed to fetch active emergencies: ${error.message}`, error.stack);
      throw new Error(`Cannot fetch active emergencies: ${error.message}`);
    }
  }

  async getTeamLocations() {
    this.logger.log('Fetching rescue team locations');

    try {
      const teams = await this.prisma.organization.findMany({
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

      this.logger.log(`Found ${teams.length} active rescue teams`);
      return teams;
    } catch (error) {
      this.logger.error(`Failed to fetch team locations: ${error.message}`, error.stack);
      throw new Error(`Cannot fetch team locations: ${error.message}`);
    }
  }

  async getHospitalCapacities() {
    this.logger.log('Fetching hospital capacities');

    try {
      const hospitals = await this.prisma.organization.findMany({
        where: { type: 'HOSPITAL', status: 'ACTIVE' },
        select: {
          id: true,
          name: true,
          medicalInfo: true,
        },
      });

      this.logger.log(`Found ${hospitals.length} active hospitals`);
      return hospitals;
    } catch (error) {
      this.logger.error(`Failed to fetch hospital capacities: ${error.message}`, error.stack);
      throw new Error(`Cannot fetch hospital capacities: ${error.message}`);
    }
  }

  async assignCase(dto: AssignCaseDto) {
    const { caseId, assignedToId } = dto;
    this.logger.log(`Assigning case ${caseId} to organization ${assignedToId}`);

    try {
      const emergency = await this.prisma.emergencyRequest.findUnique({
        where: { id: caseId },
        include: { responses: true },
      });

      if (!emergency) {
        this.logger.warn(`Emergency case ${caseId} not found`);
        throw new NotFoundException('Emergency case not found');
      }

      if (emergency.status !== EmergencyStatus.PENDING) {
        this.logger.warn(`Emergency case ${caseId} is not in PENDING status`);
        throw new BadRequestException('Emergency case can only be assigned if it is in PENDING status');
      }

      const organization = await this.prisma.organization.findUnique({
        where: { id: assignedToId },
      });

      if (!organization) {
        this.logger.warn(`Organization ${assignedToId} not found`);
        throw new NotFoundException('Organization not found');
      }

      if (!['RESCUE_TEAM', 'HOSPITAL'].includes(organization.type)) {
        this.logger.warn(`Organization ${assignedToId} is not a RESCUE_TEAM or HOSPITAL`);
        throw new BadRequestException('Only RESCUE_TEAM or HOSPITAL can be assigned to a case');
      }

      await this.prisma.emergencyResponse.create({
        data: {
          emergencyRequestId: caseId,
          organizationId: assignedToId,
          status: 'ASSIGNED',
          dispatchTime: new Date(),
        },
      });

      const updatedEmergency = await this.prisma.emergencyRequest.update({
        where: { id: caseId },
        data: { status: EmergencyStatus.ASSIGNED },
      });

      this.logger.log(`Case ${caseId} assigned to ${assignedToId}`);
      return updatedEmergency;
    } catch (error) {
      this.logger.error(`Failed to assign case ${caseId}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async cancelCase(dto: CancelCaseDto) {
    const { caseId } = dto;
    this.logger.log(`Cancelling case ${caseId}`);

    try {
      const emergency = await this.prisma.emergencyRequest.findUnique({
        where: { id: caseId },
      });

      if (!emergency) {
        this.logger.warn(`Emergency case ${caseId} not found`);
        throw new NotFoundException('Emergency case not found');
      }

      if (emergency.status === EmergencyStatus.COMPLETED) {
        this.logger.warn(`Emergency case ${caseId} is already completed and cannot be cancelled`);
        throw new BadRequestException('Completed emergency case cannot be cancelled');
      }

      if (emergency.status === EmergencyStatus.CANCELLED) {
        this.logger.warn(`Emergency case ${caseId} is already cancelled`);
        throw new BadRequestException('Emergency case is already cancelled');
      }

      const updatedEmergency = await this.prisma.emergencyRequest.update({
        where: { id: caseId },
        data: { status: EmergencyStatus.CANCELLED },
      });

      // ส่ง event stats-updated หลังจากยกเลิกเคส
      await this.notificationGateway.broadcastStatsUpdated();

      this.logger.log(`Case ${caseId} cancelled`);
      return updatedEmergency;
    } catch (error) {
      this.logger.error(`Failed to cancel case ${caseId}: ${error.message}`, error.stack);
      throw error;
    }
  }
}