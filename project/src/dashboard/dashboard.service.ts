import { Injectable, NotFoundException, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ReportQueryDto, CreateEmergencyCaseDto } from './dto/dashboard.dto';
import { Request } from 'express';
import { User } from '@prisma/client';

@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getStats() {
    const totalEmergencies = await this.prisma.emergencyRequest.count();
    const activeEmergencies = await this.prisma.emergencyRequest.count({ where: { status: 'Active' } });
    const completedEmergencies = await this.prisma.emergencyRequest.count({ where: { status: 'Resolved' } });
    const cancelledEmergencies = await this.prisma.emergencyRequest.count({ where: { status: 'Cancelled' } });
    const activeTeams = await this.prisma.organization.count({ where: { type: 'RESCUE_TEAM', status: 'ACTIVE' } });
    const hospitalBeds = await this.prisma.organization.aggregate({
      where: { type: 'HOSPITAL', status: 'ACTIVE' },
      _sum: { availableBeds: true },
    });

    return {
      totalEmergencies,
      activeEmergencies,
      completedEmergencies,
      cancelledEmergencies,
      activeTeams,
      averageResponseTime: 0,
      availableHospitalBeds: hospitalBeds._sum?.availableBeds ?? 0,
    };
  }

  async getActiveEmergencies() {
    const emergencyRequests = await this.prisma.emergencyRequest.findMany({
      where: { status: 'Active' },
      include: { patient: true },
    });

    this.logger.log(`Fetched ${emergencyRequests.length} active emergencies`);

    return emergencyRequests
      .filter((req) => {
        if (!req.patient) {
          this.logger.warn(`EmergencyRequest ${req.id} has no patient data`);
          return false;
        }
        return true;
      })
      .map((req) => {
        const medicalInfo = req.medicalInfo as any;
        return {
          id: req.id,
          title: req.description.split(' - ')[0] || 'Untitled Emergency',
          status: req.status,
          severity: medicalInfo?.severity || 1,
          reportedAt: req.createdAt.toISOString(),
          patientName: `${req.patient.firstName} ${req.patient.lastName}`,
          contactNumber: req.patient.phone || 'N/A',
          emergencyType: medicalInfo?.emergencyType || 'Unknown',
          location: {
            address: req.location || 'Unknown',
            coordinates: {
              lat: req.latitude || 0,
              lng: req.longitude || 0,
            },
          },
          assignedTo: undefined,
          description: req.description || '',
          symptoms: medicalInfo?.symptoms || [],
          patient: {
            firstName: req.patient.firstName,
            lastName: req.patient.lastName,
            phone: req.patient.phone,
          },
        };
      });
  }

  async getTeamLocations() {
    return this.prisma.organization.findMany({
      where: { type: 'RESCUE_TEAM' },
      select: { id: true, name: true, latitude: true, longitude: true },
    });
  }

  async getHospitalCapacities() {
    return this.prisma.organization.findMany({
      where: { type: 'HOSPITAL' },
      select: { id: true, name: true, latitude: true, longitude: true, status: true, availableBeds: true },
    });
  }

  async getReports(query: ReportQueryDto) {
    const { startDate, endDate, region, category } = query;
    return this.prisma.emergencyRequest.findMany({
      where: {
        AND: [
          startDate ? { createdAt: { gte: new Date(startDate) } } : {},
          endDate ? { createdAt: { lte: new Date(endDate) } } : {},
          category ? { description: { contains: category } } : {},
          region ? { location: { contains: region } } : {},
        ],
      },
      include: { patient: true, responses: { include: { organization: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createCase(dto: CreateEmergencyCaseDto, req: Request) {
    const { title, patientName, contactNumber, emergencyType, locationAddress, latitude, longitude, description, severity } = dto;
    const user = req.user as User;

    if (!user || !user.id) {
      this.logger.error('No authenticated user found in request');
      throw new NotFoundException('No authenticated user found');
    }

    const patient = await this.prisma.user.findUnique({ where: { id: user.id } });
    if (!patient) {
      this.logger.error(`Patient with id ${user.id} not found`);
      throw new NotFoundException(`Patient with id ${user.id} not found`);
    }

    const emergencyRequest = await this.prisma.emergencyRequest.create({
      data: {
        status: 'Active',
        description: description || `${title} - ${emergencyType}`,
        location: locationAddress,
        latitude: latitude || null,
        longitude: longitude || null,
        medicalInfo: { patientName, contactNumber, emergencyType, severity },
        patientId: user.id,
      },
      include: { patient: true },
    });

    return {
      id: emergencyRequest.id,
      title,
      status: emergencyRequest.status,
      severity,
      reportedAt: emergencyRequest.createdAt.toISOString(),
      patientName,
      contactNumber: contactNumber || 'N/A',
      emergencyType,
      location: { address: locationAddress, coordinates: { lat: latitude || 0, lng: longitude || 0 } },
      description: description || '',
      symptoms: [],
      patient: {
        firstName: patient.firstName,
        lastName: patient.lastName,
        phone: patient.phone,
      },
    };
  }

  async cancelCase(caseId: string, req: Request) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(caseId)) {
      throw new BadRequestException('Invalid caseId format');
    }

    const emergency = await this.prisma.emergencyRequest.findUnique({ where: { id: caseId } });
    if (!emergency) {
      throw new NotFoundException(`Case with id ${caseId} not found`);
    }

    await this.prisma.emergencyRequest.update({
      where: { id: caseId },
      data: { status: 'Cancelled' },
    });

    return { success: true, message: 'Case cancelled successfully' };
  }
}