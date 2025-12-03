import { Test, TestingModule } from "@nestjs/testing";
import { RescueService } from "./rescue.service";
import { PrismaService } from "../prisma/prisma.service";
import { NotificationService } from "../notification/notification.service";
import { NotFoundException } from "@nestjs/common";
import { RescueTeamStatus } from "./dto/rescue.dto";

describe("RescueService", () => {
  let service: RescueService;
  let prismaService: PrismaService;
  let notificationService: NotificationService;

  const mockPrismaService = {
    organization: {
      findFirst: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockNotificationService = {
    createNotification: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RescueService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: NotificationService,
          useValue: mockNotificationService,
        },
      ],
    }).compile();

    service = module.get<RescueService>(RescueService);
    prismaService = module.get<PrismaService>(PrismaService);
    notificationService = module.get<NotificationService>(NotificationService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("updateStatus", () => {
    it("should update rescue team status successfully", async () => {
      const updateDto = {
        status: RescueTeamStatus.AVAILABLE,
        notes: "Team is ready",
        currentEmergencyId: "emergency-123",
      };

      const mockTeam = {
        id: "team-123",
        name: "Test Team",
        status: RescueTeamStatus.AVAILABLE,
        notes: "Team is ready",
        currentEmergencyId: "emergency-123",
        type: "RESCUE_TEAM",
        medicalInfo: {
          currentEmergencyId: "emergency-123",
          notes: "Team is ready",
        },
      };

      mockPrismaService.organization.findFirst.mockResolvedValue({
        ...mockTeam,
        medicalInfo: {},
      });
      mockPrismaService.organization.update.mockResolvedValue(mockTeam);

      const result = await service.updateStatus("team-123", updateDto);

      expect(result).toEqual(mockTeam);
      expect(mockPrismaService.organization.update).toHaveBeenCalledWith({
        where: { id: "team-123" },
        data: {
          status: updateDto.status,
          medicalInfo: {
            currentEmergencyId: updateDto.currentEmergencyId,
            notes: updateDto.notes,
          },
        },
      });
    });

    it("should throw NotFoundException for non-existent team", async () => {
      const updateDto = {
        status: RescueTeamStatus.AVAILABLE,
        notes: "Team is ready",
        currentEmergencyId: "emergency-123",
      };

      mockPrismaService.organization.findFirst.mockResolvedValue(null);

      await expect(
        service.updateStatus("non-existent", updateDto),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
