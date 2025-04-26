import { Test, TestingModule } from "@nestjs/testing";
import { DashboardService } from "./dashboard.service";
import { PrismaService } from "../prisma/prisma.service";
import { EmergencyStatus } from "../sos/dto/sos.dto";

describe("DashboardService", () => {
  let service: DashboardService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    emergencyRequest: {
      count: jest.fn(),
      findMany: jest.fn(),
    },
    organization: {
      count: jest.fn(),
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("getStats", () => {
    it("should return dashboard statistics", async () => {
      mockPrismaService.emergencyRequest.count.mockResolvedValueOnce(100); // total
      mockPrismaService.emergencyRequest.count.mockResolvedValueOnce(20); // active
      mockPrismaService.emergencyRequest.count.mockResolvedValueOnce(70); // completed
      mockPrismaService.organization.count.mockResolvedValueOnce(15); // rescue teams
      mockPrismaService.organization.count.mockResolvedValueOnce(10); // hospitals

      const result = await service.getStats();

      expect(result).toEqual({
        totalEmergencies: 100,
        activeEmergencies: 20,
        completedEmergencies: 70,
        activeTeams: 15,
        hospitals: 10,
      });
    });
  });

  describe("getActiveEmergencies", () => {
    it("should return active emergency requests", async () => {
      const mockEmergencies = [
        {
          id: "emergency-1",
          status: EmergencyStatus.PENDING,
          patient: {
            id: "patient-1",
            firstName: "John",
            lastName: "Doe",
          },
          responses: [],
        },
      ];

      mockPrismaService.emergencyRequest.findMany.mockResolvedValue(
        mockEmergencies,
      );

      const result = await service.getActiveEmergencies();
      expect(result).toEqual(mockEmergencies);
    });
  });

  describe("getTeamLocations", () => {
    it("should return rescue team locations", async () => {
      const mockTeams = [
        {
          id: "team-1",
          name: "Rescue Team 1",
          latitude: 13.7563,
          longitude: 100.5018,
          status: "ACTIVE",
        },
      ];

      mockPrismaService.organization.findMany.mockResolvedValue(mockTeams);

      const result = await service.getTeamLocations();
      expect(result).toEqual(mockTeams);
    });
  });
});
