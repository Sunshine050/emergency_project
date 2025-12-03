import { Test, TestingModule } from "@nestjs/testing";
import { DashboardService } from "./dashboard.service";
import { PrismaService } from "../prisma/prisma.service";
import { EmergencyStatus } from "../sos/dto/sos.dto";
import { NotFoundException, BadRequestException } from "@nestjs/common";

describe("DashboardService", () => {
  let service: DashboardService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    emergencyRequest: {
      count: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    emergencyResponse: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
    organization: {
      count: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
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

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("getStats", () => {
    it("should return dashboard statistics", async () => {
      mockPrismaService.emergencyRequest.count
        .mockResolvedValueOnce(100) // totalEmergencies
        .mockResolvedValueOnce(20) // activeEmergencies
        .mockResolvedValueOnce(70) // completedEmergencies
        .mockResolvedValueOnce(5) // criticalCases
        .mockResolvedValueOnce(10); // cancelledEmergencies
      mockPrismaService.organization.count
        .mockResolvedValueOnce(15) // activeTeams
        .mockResolvedValueOnce(10); // hospitals
      mockPrismaService.emergencyResponse.findMany.mockResolvedValue([
        {
          dispatchTime: new Date('2025-05-03T10:00:00Z'),
          completionTime: new Date('2025-05-03T10:30:00Z'),
        },
        {
          dispatchTime: new Date('2025-05-03T11:00:00Z'),
          completionTime: new Date('2025-05-03T11:45:00Z'),
        },
      ]);
      mockPrismaService.organization.findMany.mockResolvedValue([
        { medicalInfo: { availableBeds: 50 } },
        { medicalInfo: { availableBeds: 30 } },
      ]);

      const result = await service.getStats();

      expect(mockPrismaService.emergencyRequest.count).toHaveBeenCalledTimes(4);
      expect(mockPrismaService.organization.count).toHaveBeenCalledTimes(2);
      expect(mockPrismaService.emergencyResponse.findMany).toHaveBeenCalledWith({
        where: { status: 'COMPLETED' },
        select: { dispatchTime: true, completionTime: true },
      });
      expect(mockPrismaService.organization.findMany).toHaveBeenCalledWith({
        where: { type: 'HOSPITAL', status: 'ACTIVE' },
        select: { medicalInfo: true },
      });

      expect(result).toEqual({
        totalEmergencies: 100,
        activeEmergencies: 20,
        completedEmergencies: 70,
        activeTeams: 15,
        connectedHospitals: 10,
        criticalCases: 5,
        averageResponseTime: 37.5, // (30 + 45) / 2 = 37.5 minutes
        availableHospitalBeds: 80, // 50 + 30
        cancelledEmergencies: 10,
      });
    });

    it("should handle zero response times and hospital beds", async () => {
      mockPrismaService.emergencyRequest.count
        .mockResolvedValueOnce(100) // totalEmergencies
        .mockResolvedValueOnce(20) // activeEmergencies
        .mockResolvedValueOnce(70) // completedEmergencies
        .mockResolvedValueOnce(5) // criticalCases
        .mockResolvedValueOnce(10); // cancelledEmergencies
      mockPrismaService.organization.count
        .mockResolvedValueOnce(15) // activeTeams
        .mockResolvedValueOnce(10); // hospitals
      mockPrismaService.emergencyResponse.findMany.mockResolvedValue([]);
      mockPrismaService.organization.findMany.mockResolvedValue([]);

      const result = await service.getStats();

      expect(result.averageResponseTime).toBe(0);
      expect(result.availableHospitalBeds).toBe(0);
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
            phone: "1234567890",
          },
          responses: [],
        },
      ];

      mockPrismaService.emergencyRequest.findMany.mockResolvedValue(mockEmergencies);

      const result = await service.getActiveEmergencies();

      expect(mockPrismaService.emergencyRequest.findMany).toHaveBeenCalledWith({
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
          medicalInfo: {},
        },
      ];

      mockPrismaService.organization.findMany.mockResolvedValue(mockTeams);

      const result = await service.getTeamLocations();

      expect(mockPrismaService.organization.findMany).toHaveBeenCalledWith({
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
      expect(result).toEqual(mockTeams);
    });
  });

  describe("getHospitalCapacities", () => {
    it("should return hospital capacities", async () => {
      const mockHospitals = [
        {
          id: "hospital-1",
          name: "Hospital 1",
          medicalInfo: { availableBeds: 50 },
        },
      ];

      mockPrismaService.organization.findMany.mockResolvedValue(mockHospitals);

      const result = await service.getHospitalCapacities();

      expect(mockPrismaService.organization.findMany).toHaveBeenCalledWith({
        where: { type: 'HOSPITAL', status: 'ACTIVE' },
        select: {
          id: true,
          name: true,
          medicalInfo: true,
        },
      });
      expect(result).toEqual(mockHospitals);
    });
  });

  describe("assignCase", () => {
    it("should assign a case to an organization", async () => {
      const dto = { caseId: "emergency-1", assignedToId: "org-1" };
      const mockEmergency = {
        id: "emergency-1",
        status: EmergencyStatus.PENDING,
        responses: [],
      };
      const mockOrganization = {
        id: "org-1",
        type: "RESCUE_TEAM",
      };
      const updatedEmergency = {
        id: "emergency-1",
        status: EmergencyStatus.ASSIGNED,
      };

      mockPrismaService.emergencyRequest.findUnique.mockResolvedValue(mockEmergency);
      mockPrismaService.organization.findUnique.mockResolvedValue(mockOrganization);
      mockPrismaService.emergencyResponse.create.mockResolvedValue({});
      mockPrismaService.emergencyRequest.update.mockResolvedValue(updatedEmergency);

      const result = await service.assignCase(dto);

      expect(mockPrismaService.emergencyRequest.findUnique).toHaveBeenCalledWith({
        where: { id: dto.caseId },
        include: { responses: true },
      });
      expect(mockPrismaService.organization.findUnique).toHaveBeenCalledWith({
        where: { id: dto.assignedToId },
      });
      expect(mockPrismaService.emergencyResponse.create).toHaveBeenCalled();
      expect(mockPrismaService.emergencyRequest.update).toHaveBeenCalledWith({
        where: { id: dto.caseId },
        data: { status: EmergencyStatus.ASSIGNED },
      });
      expect(result).toEqual(updatedEmergency);
    });

    it("should throw NotFoundException if emergency not found", async () => {
      const dto = { caseId: "emergency-1", assignedToId: "org-1" };

      mockPrismaService.emergencyRequest.findUnique.mockResolvedValue(null);

      await expect(service.assignCase(dto)).rejects.toThrow(NotFoundException);
      expect(mockPrismaService.emergencyResponse.create).not.toHaveBeenCalled();
      expect(mockPrismaService.emergencyRequest.update).not.toHaveBeenCalled();
    });

    it("should throw NotFoundException if organization not found", async () => {
      const dto = { caseId: "emergency-1", assignedToId: "org-1" };
      const mockEmergency = {
        id: "emergency-1",
        status: EmergencyStatus.PENDING,
        responses: [],
      };

      mockPrismaService.emergencyRequest.findUnique.mockResolvedValue(mockEmergency);
      mockPrismaService.organization.findUnique.mockResolvedValue(null);

      await expect(service.assignCase(dto)).rejects.toThrow(NotFoundException);
      expect(mockPrismaService.emergencyResponse.create).not.toHaveBeenCalled();
      expect(mockPrismaService.emergencyRequest.update).not.toHaveBeenCalled();
    });

    it("should throw BadRequestException if emergency is not in PENDING status", async () => {
      const dto = { caseId: "emergency-1", assignedToId: "org-1" };
      const mockEmergency = {
        id: "emergency-1",
        status: EmergencyStatus.ASSIGNED,
        responses: [],
      };
      const mockOrganization = {
        id: "org-1",
        type: "RESCUE_TEAM",
      };

      mockPrismaService.emergencyRequest.findUnique.mockResolvedValue(mockEmergency);
      mockPrismaService.organization.findUnique.mockResolvedValue(mockOrganization);

      await expect(service.assignCase(dto)).rejects.toThrow(BadRequestException);
      expect(mockPrismaService.emergencyResponse.create).not.toHaveBeenCalled();
      expect(mockPrismaService.emergencyRequest.update).not.toHaveBeenCalled();
    });

    it("should throw BadRequestException if organization is not RESCUE_TEAM or HOSPITAL", async () => {
      const dto = { caseId: "emergency-1", assignedToId: "org-1" };
      const mockEmergency = {
        id: "emergency-1",
        status: EmergencyStatus.PENDING,
        responses: [],
      };
      const mockOrganization = {
        id: "org-1",
        type: "OTHER",
      };

      mockPrismaService.emergencyRequest.findUnique.mockResolvedValue(mockEmergency);
      mockPrismaService.organization.findUnique.mockResolvedValue(mockOrganization);

      await expect(service.assignCase(dto)).rejects.toThrow(BadRequestException);
      expect(mockPrismaService.emergencyResponse.create).not.toHaveBeenCalled();
      expect(mockPrismaService.emergencyRequest.update).not.toHaveBeenCalled();
    });
  });

  describe("cancelCase", () => {
    it("should cancel a case", async () => {
      const dto = { caseId: "emergency-1" };
      const mockEmergency = {
        id: "emergency-1",
        status: EmergencyStatus.PENDING,
      };
      const updatedEmergency = {
        id: "emergency-1",
        status: EmergencyStatus.CANCELLED,
      };

      mockPrismaService.emergencyRequest.findUnique.mockResolvedValue(mockEmergency);
      mockPrismaService.emergencyRequest.update.mockResolvedValue(updatedEmergency);

      const result = await service.cancelCase(dto);

      expect(mockPrismaService.emergencyRequest.findUnique).toHaveBeenCalledWith({
        where: { id: dto.caseId },
      });
      expect(mockPrismaService.emergencyRequest.update).toHaveBeenCalledWith({
        where: { id: dto.caseId },
        data: { status: EmergencyStatus.CANCELLED },
      });
      expect(result).toEqual(updatedEmergency);
    });

    it("should throw NotFoundException if emergency not found", async () => {
      const dto = { caseId: "emergency-1" };

      mockPrismaService.emergencyRequest.findUnique.mockResolvedValue(null);

      await expect(service.cancelCase(dto)).rejects.toThrow(NotFoundException);
      expect(mockPrismaService.emergencyRequest.update).not.toHaveBeenCalled();
    });

    it("should throw BadRequestException if emergency is already completed", async () => {
      const dto = { caseId: "emergency-1" };
      const mockEmergency = {
        id: "emergency-1",
        status: EmergencyStatus.COMPLETED,
      };

      mockPrismaService.emergencyRequest.findUnique.mockResolvedValue(mockEmergency);

      await expect(service.cancelCase(dto)).rejects.toThrow(BadRequestException);
      expect(mockPrismaService.emergencyRequest.update).not.toHaveBeenCalled();
    });

    it("should throw BadRequestException if emergency is already cancelled", async () => {
      const dto = { caseId: "emergency-1" };
      const mockEmergency = {
        id: "emergency-1",
        status: EmergencyStatus.CANCELLED,
      };

      mockPrismaService.emergencyRequest.findUnique.mockResolvedValue(mockEmergency);

      await expect(service.cancelCase(dto)).rejects.toThrow(BadRequestException);
      expect(mockPrismaService.emergencyRequest.update).not.toHaveBeenCalled();
    });
  });
});