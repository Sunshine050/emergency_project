import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { NotificationService } from "../notification/notification.service";
import {
  CreateHospitalDto,
  UpdateHospitalDto,
  UpdateHospitalCapacityDto,
  AcceptEmergencyDto,
} from "./dto/hospital.dto";
import { EmergencyStatus } from "../sos/dto/sos.dto";

// กำหนด type สำหรับ QueryMode
type QueryMode = "default" | "insensitive";

@Injectable()
export class HospitalService {
  private readonly logger = new Logger(HospitalService.name);

  constructor(
    private prisma: PrismaService,
    private notificationService: NotificationService,
  ) {
    this.logger.log("HospitalService initialized");
  }

  async create(createHospitalDto: CreateHospitalDto) {
    this.logger.log("Creating new hospital");
    const hospital = await this.prisma.organization.create({
      data: {
        ...createHospitalDto,
        type: "HOSPITAL",
      },
    });

    // ส่ง event ผ่าน WebSocket เมื่อสร้างโรงพยาบาลสำเร็จ โดยเรียก method จาก NotificationService
    await this.notificationService.broadcastHospitalCreated({
      id: hospital.id,
      name: hospital.name,
    });

    return hospital;
  }

  async findAll(search?: string) {
    this.logger.log(`Finding all hospitals with search: ${search}`);
    const where = {
      type: "HOSPITAL",
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" as QueryMode } },
          { city: { contains: search, mode: "insensitive" as QueryMode } },
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
    this.logger.log(`Finding hospital with ID: ${id}`);
    const hospital = await this.prisma.organization.findFirst({
      where: {
        id,
        type: "HOSPITAL",
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
      this.logger.error(`Hospital with ID ${id} not found`);
      throw new NotFoundException("Hospital not found");
    }

    return {
      ...hospital,
      medicalInfo: hospital.medicalInfo || {},
    };
  }

  async update(id: string, updateHospitalDto: UpdateHospitalDto) {
    this.logger.log(`Updating hospital with ID: ${id}`);
    const hospital = await this.findOne(id);

    return this.prisma.organization.update({
      where: { id },
      data: updateHospitalDto,
    });
  }

  async remove(id: string) {
    this.logger.log(`Removing hospital with ID: ${id}`);
    const hospital = await this.findOne(id);

    return this.prisma.organization.update({
      where: { id },
      data: { status: "INACTIVE" },
    });
  }

  async updateCapacity(
    id: string,
    updateCapacityDto: UpdateHospitalCapacityDto,
  ) {
    this.logger.log(`Updating capacity for hospital with ID: ${id}`);
    const hospital = await this.findOne(id);

    const medicalInfo = hospital.medicalInfo as Record<string, any> | null;

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

  async acceptEmergency(
    hospitalId: string,
    acceptEmergencyDto: AcceptEmergencyDto,
  ) {
    this.logger.log(`Accepting emergency for hospital ID: ${hospitalId}`);
    const hospital = await this.findOne(hospitalId);

    const emergency = await this.prisma.emergencyRequest.findUnique({
      where: { id: acceptEmergencyDto.emergencyId },
      include: { patient: true },
    });

    if (!emergency) {
      this.logger.error(`Emergency request with ID ${acceptEmergencyDto.emergencyId} not found`);
      throw new NotFoundException("Emergency request not found");
    }

    if (emergency.status !== EmergencyStatus.PENDING) {
      this.logger.error(`Emergency request ${acceptEmergencyDto.emergencyId} is not in PENDING state, current state: ${emergency.status}`);
      throw new BadRequestException("Emergency request is no longer pending");
    }

    const response = await this.prisma.emergencyResponse.create({
      data: {
        status: "ACCEPTED",
        notes: acceptEmergencyDto.notes,
        organizationId: hospitalId,
        emergencyRequestId: emergency.id,
      },
    });

    await this.prisma.emergencyRequest.update({
      where: { id: emergency.id },
      data: { status: EmergencyStatus.ASSIGNED },
    });

    await this.notificationService.createNotification({
      type: "EMERGENCY_ACCEPTED",
      title: "Hospital Accepted Your Emergency",
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

  async findNearbyHospitals(
    latitude: number,
    longitude: number,
    radius: number = 10,
  ) {
    this.logger.log(
      `Finding nearby hospitals for lat: ${latitude}, lon: ${longitude}, radius: ${radius}`,
    );
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
      FROM "emergency_project"."organizations"
      WHERE 
        type = 'HOSPITAL'
        AND status = 'ACTIVE'
      HAVING distance <= ${radius}
      ORDER BY distance
    `;

    return hospitals;
  }

  async updateEmergencyResponseStatus(responseId: string) {
    this.logger.log(`Fetching emergency response with ID: ${responseId}`);
    const emergencyResponse = await this.prisma.emergencyResponse.findUnique({
      where: { id: responseId },
      include: { emergencyRequest: true },
    });

    if (!emergencyResponse) {
      this.logger.error(`Emergency response with ID ${responseId} not found`);
      throw new NotFoundException("Emergency response not found");
    }

    if (emergencyResponse.status !== "ACCEPTED") {
      this.logger.error(
        `Emergency response ${responseId} is not in ACCEPTED state, current state: ${emergencyResponse.status}`,
      );
      throw new BadRequestException(
        "Emergency response must be in ACCEPTED state to update to IN_PROGRESS",
      );
    }

    try {
      this.logger.log(
        `Updating emergency response ${responseId} to IN_PROGRESS`,
      );
      const updatedResponse = await this.prisma.emergencyResponse.update({
        where: { id: responseId },
        data: { status: "IN_PROGRESS" },
      });

      this.logger.log(
        `Updating emergency request ${emergencyResponse.emergencyRequestId} to IN_PROGRESS`,
      );
      await this.prisma.emergencyRequest.update({
        where: { id: emergencyResponse.emergencyRequestId },
        data: { status: EmergencyStatus.IN_PROGRESS },
      });

      this.logger.log(
        `Successfully updated emergency response ${responseId}`,
      );
      return updatedResponse;
    } catch (error) {
      this.logger.error(
        `Error updating emergency response ${responseId}: ${error.message}`,
      );
      throw new BadRequestException(
        "Failed to update emergency response: " + error.message,
      );
    }
  }

  async notifyRescueTeam(responseId: string) {
    this.logger.log(`Fetching emergency response with ID: ${responseId}`);
    const emergencyResponse = await this.prisma.emergencyResponse.findUnique({
      where: { id: responseId },
      include: {
        emergencyRequest: { include: { patient: true } },
        organization: true,
      },
    });

    if (!emergencyResponse) {
      this.logger.error(`Emergency response with ID ${responseId} not found`);
      throw new NotFoundException("Emergency response not found");
    }

    this.logger.log(`Fetching RESCUE_TEAM organizations`);
    const rescueTeams = await this.prisma.organization.findMany({
      where: { type: "RESCUE_TEAM", status: "ACTIVE" },
      include: { users: true },
    });

    if (!rescueTeams || rescueTeams.length === 0) {
      this.logger.error(`No active RESCUE_TEAM found`);
      throw new NotFoundException("No active rescue teams found");
    }

    try {
      this.logger.log(
        `Notifying RESCUE_TEAM for emergency response ${responseId}`,
      );
      for (const rescueTeam of rescueTeams) {
        for (const user of rescueTeam.users) {
          await this.notificationService.createNotification({
            type: "RESCUE_REQUEST",
            title: "Emergency Assistance Requested",
            body: `Hospital ${emergencyResponse.organization.name} requests assistance for emergency at location: ${emergencyResponse.emergencyRequest.location}`,
            userId: user.id,
            metadata: {
              emergencyId: emergencyResponse.emergencyRequestId,
              hospitalId: emergencyResponse.organizationId,
              hospitalName: emergencyResponse.organization.name,
              location: emergencyResponse.emergencyRequest.location,
              latitude: emergencyResponse.emergencyRequest.latitude,
              longitude: emergencyResponse.emergencyRequest.longitude,
            },
          });
          this.logger.log(
            `Notified user ${user.id} in RESCUE_TEAM ${rescueTeam.name}`,
          );
        }
      }

      this.logger.log(
        `Successfully notified RESCUE_TEAM for emergency response ${responseId}`,
      );
      return { message: "Rescue teams notified successfully" };
    } catch (error) {
      this.logger.error(
        `Error notifying RESCUE_TEAM for emergency response ${responseId}: ${error.message}`,
      );
      throw new BadRequestException(
        "Failed to notify rescue teams: " + error.message,
      );
    }
  }

  async getEmergencyResponse(responseId: string) {
    this.logger.log(`Fetching emergency response with ID: ${responseId}`);
    try {
      const emergencyResponse = await this.prisma.emergencyResponse.findUnique({
        where: { id: responseId },
        include: {
          emergencyRequest: true,
          organization: true,
        },
      });

      if (!emergencyResponse) {
        this.logger.error(`Emergency response with ID ${responseId} not found in database`);
        throw new NotFoundException("Emergency response not found");
      }

      this.logger.log(`Successfully fetched emergency response ${responseId}`);
      return emergencyResponse;
    } catch (error) {
      this.logger.error(
        `Error fetching emergency response ${responseId}: ${error.message}`,
      );
      throw error;
    }
  }

  // เพิ่ม method ใหม่: อัปเดตสถานะ EmergencyResponse ด้วย raw input
  async updateEmergencyResponseStatusManual(responseId: string, status: string) {
    this.logger.log(`Fetching emergency response with ID: ${responseId} to update status to ${status}`);
    const emergencyResponse = await this.prisma.emergencyResponse.findUnique({
      where: { id: responseId },
      include: { emergencyRequest: true },
    });

    if (!emergencyResponse) {
      this.logger.error(`Emergency response with ID ${responseId} not found`);
      throw new NotFoundException("Emergency response not found");
    }

    // ตรวจสอบสถานะที่ส่งมา
    const validStatuses = ["ACCEPTED", "IN_PROGRESS", "COMPLETED", "CANCELLED"];
    if (!validStatuses.includes(status)) {
      this.logger.error(`Invalid status provided: ${status}. Valid statuses are: ${validStatuses.join(", ")}`);
      throw new BadRequestException(`Invalid status. Valid statuses are: ${validStatuses.join(", ")}`);
    }

    try {
      this.logger.log(`Updating emergency response ${responseId} to status: ${status}`);
      const updatedResponse = await this.prisma.emergencyResponse.update({
        where: { id: responseId },
        data: { status },
      });

      this.logger.log(`Updating emergency request ${emergencyResponse.emergencyRequestId} to status: ${status}`);
      await this.prisma.emergencyRequest.update({
        where: { id: emergencyResponse.emergencyRequestId },
        data: { status: status as EmergencyStatus },
      });

      this.logger.log(`Successfully updated emergency response ${responseId} to status: ${status}`);
      return updatedResponse;
    } catch (error) {
      this.logger.error(
        `Error updating emergency response ${responseId} to status ${status}: ${error.message}`,
      );
      throw new BadRequestException(
        `Failed to update emergency response: ${error.message}`,
      );
    }
  }
}