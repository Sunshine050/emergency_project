import {
  Injectable,
  NotFoundException,
  Logger,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmergencyStatus } from '../sos/dto/sos.dto';
import { AssignCaseDto, CancelCaseDto } from './dto/dashboard.dto';
import { NotificationGateway } from '../notification/notification.gateway';

interface HospitalMedicalInfo {
  availableBeds?: number;
  [key: string]: any;
}

interface OrganizationWithMedicalInfo {
  id: string;
  name: string;
  medicalInfo?: unknown;
}

@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);

  constructor(
    private prisma: PrismaService,
    private notificationGateway: NotificationGateway, // Inject NotificationGateway
  ) {}

  /**
   * Helper: safely read severity from medicalInfo which may be object or JSON string
   */
  private getSeverity(medicalInfo: any): number | null {
    if (!medicalInfo) return null;
    try {
      if (typeof medicalInfo === 'object') {
        return typeof medicalInfo.severity === 'number'
          ? medicalInfo.severity
          : medicalInfo.severity !== undefined
          ? Number(medicalInfo.severity)
          : null;
      }
      if (typeof medicalInfo === 'string') {
        const parsed = JSON.parse(medicalInfo);
        return parsed && parsed.severity !== undefined ? Number(parsed.severity) : null;
      }
    } catch (err) {
      this.logger.debug(`Failed to parse medicalInfo for severity: ${err?.message ?? err}`);
      return null;
    }
    return null;
  }

  /**
   * Helper: safely extract availableBeds from hospital.medicalInfo
   */
  private getAvailableBeds(medicalInfo: any): number | null {
    if (!medicalInfo) return null;
    try {
      if (typeof medicalInfo === 'object') {
        const beds = medicalInfo.availableBeds ?? medicalInfo.available_beds;
        return typeof beds === 'number' ? beds : beds ? Number(beds) : null;
      }
      if (typeof medicalInfo === 'string') {
        const parsed = JSON.parse(medicalInfo);
        const beds = parsed?.availableBeds ?? parsed?.available_beds;
        return typeof beds === 'number' ? beds : beds ? Number(beds) : null;
      }
    } catch (err) {
      this.logger.debug(`Failed to parse medicalInfo for beds: ${err?.message ?? err}`);
      return null;
    }
    return null;
  }

  async getStats() {
    this.logger.log('Fetching dashboard statistics');

    try {
      // Basic counts (DB-side)
      const [
        totalEmergencies,
        activeEmergencies,
        completedEmergencies,
        activeTeams,
        connectedHospitalsCount,
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
          where: { status: EmergencyStatus.CANCELLED },
        }),
        // response times - we will filter in JS to be safe
        this.prisma.emergencyResponse.findMany({
          where: { status: 'COMPLETED' },
          select: {
            dispatchTime: true,
            completionTime: true,
          },
        }),
        // hospitals with medicalInfo (may be JSON object or string)
        this.prisma.organization.findMany({
          where: { type: 'HOSPITAL', status: 'ACTIVE' },
          select: {
            id: true,
            name: true,
            // medicalInfo: true,
          },
        }),
      ]);

      // Compute criticalCases by loading medicalInfo and filtering in JS.
      // Prisma JSON filtering varies by DB and Prisma version; safer to handle in JS.
      const emergenciesWithMedical = await this.prisma.emergencyRequest.findMany({
        select: { medicalInfo: true },
      });

      const criticalCases = emergenciesWithMedical.reduce((acc, e) => {
        const sev = this.getSeverity(e.medicalInfo);
        return acc + (sev === 4 ? 1 : 0);
      }, 0);

      // Compute average response time (in minutes) using only responses with both times
      let averageResponseTime = 0;
      if (responseTimes && responseTimes.length > 0) {
        let totalMinutes = 0;
        let validCount = 0;
        for (const r of responseTimes) {
          if (r.dispatchTime && r.completionTime) {
            const diffMs =
              new Date(r.completionTime).getTime() - new Date(r.dispatchTime).getTime();
            if (!Number.isNaN(diffMs)) {
              totalMinutes += diffMs / (1000 * 60);
              validCount += 1;
            }
          }
        }
        if (validCount > 0) averageResponseTime = totalMinutes / validCount;
      }

      // Sum available beds safely
      let availableHospitalBeds = 0;
      (hospitalCapacities as OrganizationWithMedicalInfo[]).forEach((hospital) => {
        const beds = this.getAvailableBeds((hospital as any).medicalInfo);
        if (typeof beds === 'number' && !Number.isNaN(beds)) {
          availableHospitalBeds += beds;
        }
      });

      const stats = {
        totalEmergencies,
        activeEmergencies,
        completedEmergencies,
        activeTeams,
        connectedHospitals: connectedHospitalsCount,
        criticalCases,
        averageResponseTime: Number(averageResponseTime.toFixed(2)),
        availableHospitalBeds,
        cancelledEmergencies,
      };

      this.logger.log(`Dashboard stats fetched: ${JSON.stringify(stats)}`);
      return stats;
    } catch (error) {
      // Log full error and throw a controlled Nest exception so controller returns 500 cleanly
      this.logger.error(`Failed to fetch dashboard stats: ${error?.message ?? error}`, error?.stack);
      throw new InternalServerErrorException(`Cannot fetch dashboard stats: ${error?.message ?? 'Internal error'}`);
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
      this.logger.error(`Failed to fetch active emergencies: ${error?.message ?? error}`, error?.stack);
      throw new InternalServerErrorException(`Cannot fetch active emergencies: ${error?.message ?? 'Internal error'}`);
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
          // medicalInfo: true,
        },
      });

      this.logger.log(`Found ${teams.length} active rescue teams`);
      return teams;
    } catch (error) {
      this.logger.error(`Failed to fetch team locations: ${error?.message ?? error}`, error?.stack);
      throw new InternalServerErrorException(`Cannot fetch team locations: ${error?.message ?? 'Internal error'}`);
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
          // medicalInfo: true,
        },
      });

      this.logger.log(`Found ${hospitals.length} active hospitals`);
      return hospitals;
    } catch (error) {
      this.logger.error(`Failed to fetch hospital capacities: ${error?.message ?? error}`, error?.stack);
      throw new InternalServerErrorException(`Cannot fetch hospital capacities: ${error?.message ?? 'Internal error'}`);
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
      this.logger.error(`Failed to assign case ${caseId}: ${error?.message ?? error}`, error?.stack);
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
      try {
        await this.notificationGateway.broadcastStatsUpdated();
      } catch (gwErr) {
        this.logger.warn(`Failed to broadcast stats update: ${gwErr?.message ?? gwErr}`);
        // don't fail entire request because notification broadcasting failed
      }

      this.logger.log(`Case ${caseId} cancelled`);
      return updatedEmergency;
    } catch (error) {
      this.logger.error(`Failed to cancel case ${caseId}: ${error?.message ?? error}`, error?.stack);
      throw error;
    }
  }
}
