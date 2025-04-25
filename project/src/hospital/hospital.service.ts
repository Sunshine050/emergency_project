import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationService } from '../notification/notification.service';
import { CreateHospitalDto, UpdateHospitalDto, UpdateHospitalCapacityDto, AcceptEmergencyDto } from './dto/hospital.dto';
import { EmergencyStatus } from '../sos/dto/sos.dto';

// กำหนด type สำหรับ QueryMode
type QueryMode = 'default' | 'insensitive';

@Injectable()
export class HospitalService {
  constructor(
    private prisma: PrismaService,
    private notificationService: NotificationService,
  ) {}

  async create(createHospitalDto: CreateHospitalDto) {
    return this.prisma.organization.create({
      data: {
        ...createHospitalDto,
        type: 'HOSPITAL',
      },
    });
  }

  async findAll(search?: string) {
    const where = {
      type: 'HOSPITAL',
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' as QueryMode } },
          { city: { contains: search, mode: 'insensitive' as QueryMode } },
        ],
      }),
    };

    return this.prisma.organization.findMany({
      where,
      include: {
        users: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
    });
  }

  async findOne(id: string) {
    const hospital = await this.prisma.organization.findFirst({
      where: {
        id,
        type: 'HOSPITAL',
      },
      include: {
        users: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
        emergencyResponses: {
          include: {
            emergencyRequest: true,
          },
        },
      },
    });

    if (!hospital) {
      throw new NotFoundException('Hospital not found');
    }

    return {
      ...hospital,
      medicalInfo: hospital.medicalInfo || {},
    };
  }

  async update(id: string, updateHospitalDto: UpdateHospitalDto) {
    const hospital = await this.findOne(id);

    return this.prisma.organization.update({
      where: { id },
      data: updateHospitalDto,
    });
  }

  async remove(id: string) {
    const hospital = await this.findOne(id);

    return this.prisma.organization.update({
      where: { id },
      data: { status: 'INACTIVE' },
    });
  }

  async updateCapacity(id: string, updateCapacityDto: UpdateHospitalCapacityDto) {
    const hospital = await this.findOne(id);

    const medicalInfo = hospital.medicalInfo as Record<string, any> | null;

    // แปลง updateCapacityDto เป็น plain object
    const capacityPlainObject = { ...updateCapacityDto };

    return this.prisma.organization.update({
      where: { id },
      data: {
        medicalInfo: {
          ...(medicalInfo || {}),
          capacity: capacityPlainObject,
        },
      },
    });
  }

  async acceptEmergency(hospitalId: string, acceptEmergencyDto: AcceptEmergencyDto) {
    const hospital = await this.findOne(hospitalId);
    
    const emergency = await this.prisma.emergencyRequest.findUnique({
      where: { id: acceptEmergencyDto.emergencyId },
      include: { patient: true },
    });

    if (!emergency) {
      throw new NotFoundException('Emergency request not found');
    }

    if (emergency.status !== EmergencyStatus.PENDING) {
      throw new BadRequestException('Emergency request is no longer pending');
    }

    // Create emergency response
    const response = await this.prisma.emergencyResponse.create({
      data: {
        status: 'ACCEPTED',
        notes: acceptEmergencyDto.notes,
        organizationId: hospitalId,
        emergencyRequestId: emergency.id,
      },
    });

    // Update emergency request status
    await this.prisma.emergencyRequest.update({
      where: { id: emergency.id },
      data: { status: EmergencyStatus.ASSIGNED },
    });

    // Notify patient
    await this.notificationService.createNotification({
      type: 'EMERGENCY_ACCEPTED',
      title: 'Hospital Accepted Your Emergency',
      body: `${hospital.name} has accepted your emergency request`,
      userId: emergency.patient.id,
      metadata: {
        emergencyId: emergency.id,
        hospitalId: hospital.id,
        hospitalName: hospital.name,
      },
    });

    return response;
  }

  async findNearbyHospitals(latitude: number, longitude: number, radius: number = 10) {
    // Using Haversine formula to calculate distance
    const hospitals = await this.prisma.$queryRaw`
      SELECT 
        id,
        name,
        address,
        city,
        latitude,
        longitude,
        "contactPhone",
        "contactEmail",
        status,
        (
          6371 * acos(
            cos(radians(${latitude})) * cos(radians(latitude)) *
            cos(radians(longitude) - radians(${longitude})) +
            sin(radians(${latitude})) * sin(radians(latitude))
          )
        ) AS distance
      FROM "organizations"
      WHERE 
        type = 'HOSPITAL'
        AND status = 'ACTIVE'
      HAVING distance <= ${radius}
      ORDER BY distance
    `;

    return hospitals;
  }
}