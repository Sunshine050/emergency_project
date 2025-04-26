import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { NotificationService } from "../notification/notification.service";
import {
  CreateRescueTeamDto,
  UpdateRescueTeamDto,
  UpdateRescueTeamStatusDto,
} from "./dto/rescue.dto";
import { EmergencyStatus } from "../sos/dto/sos.dto";

// กำหนด type สำหรับ QueryMode
type QueryMode = "default" | "insensitive";

@Injectable()
export class RescueService {
  constructor(
    private prisma: PrismaService,
    private notificationService: NotificationService,
  ) {}

  async create(createRescueTeamDto: CreateRescueTeamDto) {
    return this.prisma.organization.create({
      data: {
        ...createRescueTeamDto,
        type: "RESCUE_TEAM",
      },
    });
  }

  async findAll(search?: string) {
    const where = {
      type: "RESCUE_TEAM",
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
    const rescueTeam = await this.prisma.organization.findFirst({
      where: {
        id,
        type: "RESCUE_TEAM",
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

    if (!rescueTeam) {
      throw new NotFoundException("Rescue team not found");
    }

    return {
      ...rescueTeam,
      medicalInfo: rescueTeam.medicalInfo || {},
    };
  }

  async update(id: string, updateRescueTeamDto: UpdateRescueTeamDto) {
    await this.findOne(id);

    return this.prisma.organization.update({
      where: { id },
      data: updateRescueTeamDto,
    });
  }

  async updateStatus(id: string, updateStatusDto: UpdateRescueTeamStatusDto) {
    const rescueTeam = await this.findOne(id);

    const medicalInfo = rescueTeam.medicalInfo as Record<string, any> | null;

    return this.prisma.organization.update({
      where: { id },
      data: {
        status: updateStatusDto.status,
        medicalInfo: {
          ...(medicalInfo || {}),
          currentEmergencyId: updateStatusDto.currentEmergencyId,
          notes: updateStatusDto.notes,
        },
      },
    });
  }

  async findAvailableTeams(
    latitude: number,
    longitude: number,
    radius: number = 10,
  ) {
    // Using Haversine formula to calculate distance
    const teams = await this.prisma.$queryRaw`
      SELECT 
        id,
        name,
        address,
        city,
        latitude,
        longitude,
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
        type = 'RESCUE_TEAM'
        AND status = 'AVAILABLE'
      HAVING distance <= ${radius}
      ORDER BY distance
    `;

    return teams;
  }
}
