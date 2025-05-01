import { Test, TestingModule } from "@nestjs/testing";
import { DashboardService } from "./dashboard.service";
import { PrismaService } from "../prisma/prisma.service";
import { EmergencyStatus } from "../sos/dto/sos.dto";
import { NotFoundException } from "@nestjs/common";

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

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("getStats", () => {
    it("should return dashboard statistics", async () => {
      // Mock ผลลัพธ์สำหรับ Promise.all
      mockPrismaService.emergencyRequest.count
        .mockResolvedValueOnce(100) // totalEmergencies
        .mockResolvedValueOnce(20) // activeEmergencies
        .mockResolvedValueOnce(70) // completedEmergencies
        .mockResolvedValueOnce(5) // cancelledEmergencies
        .mockResolvedValueOnce(3); // criticalCases

      mockPrismaService.emergencyRequest.findMany.mockResolvedValueOnce([
        {
          createdAt: new Date("2025-01-01T00:00:00Z"),
          updatedAt: new Date("2025-01-01T00:05:00Z"), // 5 นาที
        },
      ]);

      mockPrismaService.organization.count
        .mockResolvedValueOnce(15) // activeTeams
        .mockResolvedValueOnce(10); // hospitals

      mockPrismaService.organization.findMany.mockResolvedValueOnce([
        {
          medicalInfo: { totalBeds: 100, occupiedBeds: 80 },
        },
      ]);

      const result = await service.getStats();

      expect(result).toEqual({
        totalEmergencies: 100,
        activeEmergencies: 20,
        completedEmergencies: 70,
        cancelledEmergencies: 5,
        averageResponseTime: 5, // 5 นาที
        activeTeams: 15,
        availableHospitalBeds: 20, // 100 - 80
        connectedHospitals: 10,
        criticalCases: 3,
      });
    });
  });

  describe("getActiveEmergencies", () => {
    it("should return active emergency requests", async () => {
      const mockEmergencies = [
        {
          id: "emergency-1",
          title: "Car Accident",
          status: EmergencyStatus.PENDING,
          severity: 4,
          createdAt: new Date("2025-01-01T00:00:00Z"),
          description: "Car accident on Highway 7",
          symptoms: ["Bleeding"],
          location: { address: "Highway 7", coordinates: { lat: 13.7563, lng: 100.5018 } },
          latitude: 13.7563,
          longitude: 100.5018,
          emergencyType: "ACCIDENT",
          patient: {
            id: "patient-1",
            firstName: "John",
            lastName: "Doe",
            phone: "123-456-7890",
          },
          responses: [],
        },
      ];

      mockPrismaService.emergencyRequest.findMany.mockResolvedValue(mockEmergencies);

      const result = await service.getActiveEmergencies();

      expect(result).toEqual([
        {
          id: "emergency-1",
          title: "Car Accident",
          status: EmergencyStatus.PENDING,
          severity: 4,
          reportedAt: new Date("2025-01-01T00:00:00Z").toISOString(),
          patientName: "John Doe",
          contactNumber: "123-456-7890",
          emergencyType: "ACCIDENT",
          location: {
            address: "Highway 7",
            coordinates: { lat: 13.7563, lng: 100.5018 },
          },
          assignedTo: undefined,
          description: "Car accident on Highway 7",
          symptoms: ["Bleeding"],
        },
      ]);
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
      expect(result).toEqual(mockTeams);
    });
  });

  describe("getHospitalCapacities", () => {
    it("should return hospital capacities", async () => {
      const mockHospitals = [
        {
          id: "hospital-1",
          name: "Thonburi Hospital",
          medicalInfo: { totalBeds: 100, occupiedBeds: 80 },
        },
      ];

      mockPrismaService.organization.findMany.mockResolvedValue(mockHospitals);

      const result = await service.getHospitalCapacities();
      expect(result).toEqual(mockHospitals);
    });
  });

  describe("assignCase", () => {
    it("should assign a case to an organization", async () => {
      const mockEmergency = {
        id: "emergency-1",
        title: "Car Accident",
        status: EmergencyStatus.PENDING,
        severity: 4,
        createdAt: new Date("2025-01-01T00:00:00Z"),
        description: "Car accident on Highway 7",
        symptoms: ["Bleeding"],
        location: { address: "Highway 7", coordinates: { lat: 13.7563, lng: 100.5018 } },
        latitude: 13.7563,
        longitude: 100.5018,
        emergencyType: "ACCIDENT",
        patient: { firstName: "John", lastName: "Doe", phone: "123-456-7890" },
        responses: [],
      };

      const mockOrganization = {
        id: "org-1",
        name: "Thonburi Hospital",
        type: "HOSPITAL",
        users: [{ id: "user-1" }],
      };

      const mockUpdatedEmergency = {
        ...mockEmergency,
        status: EmergencyStatus.ASSIGNED,
        responses: [{ organization: { name: "Thonburi Hospital" } }],
      };

      mockPrismaService.emergencyRequest.findUnique.mockResolvedValue(mockEmergency);
      mockPrismaService.organization.findUnique.mockResolvedValue(mockOrganization);
      mockPrismaService.emergencyRequest.update.mockResolvedValue(mockUpdatedEmergency);

      const result = await service.assignCase("emergency-1", "org-1");

      expect(result).toEqual({
        id: "emergency-1",
        title: "Car Accident",
        status: EmergencyStatus.ASSIGNED,
        severity: 4,
        reportedAt: new Date("2025-01-01T00:00:00Z").toISOString(),
        patientName: "John Doe",
        contactNumber: "123-456-7890",
        emergencyType: "ACCIDENT",
        location: {
          address: "Highway 7",
          coordinates: { lat: 13.7563, lng: 100.5018 },
        },
        assignedTo: "Thonburi Hospital",
        description: "Car accident on Highway 7",
        symptoms: ["Bleeding"],
      });
    });

    it("should throw NotFoundException if emergency not found", async () => {
      mockPrismaService.emergencyRequest.findUnique.mockResolvedValue(null);

      await expect(service.assignCase("emergency-1", "org-1")).rejects.toThrow(NotFoundException);
    });
  });

  describe("cancelCase", () => {
    it("should cancel a case", async () => {
      const mockEmergency = {
        id: "emergency-1",
        title: "Car Accident",
        status: EmergencyStatus.ASSIGNED,
        severity: 4,
        createdAt: new Date("2025-01-01T00:00:00Z"),
        description: "Car accident on Highway 7",
        symptoms: ["Bleeding"],
        location: { address: "Highway 7", coordinates: { lat: 13.7563, lng: 100.5018 } },
        latitude: 13.7563,
        longitude: 100.5018,
        emergencyType: "ACCIDENT",
        patient: { firstName: "John", lastName: "Doe", phone: "123-456-7890" },
        responses: [{ organization: { name: "Thonburi Hospital", users: [{ id: "user-1" }] } }],
      };

      const mockUpdatedEmergency = {
        ...mockEmergency,
        status: EmergencyStatus.CANCELLED,
      };

      mockPrismaService.emergencyRequest.findUnique.mockResolvedValue(mockEmergency);
      mockPrismaService.emergencyRequest.update.mockResolvedValue(mockUpdatedEmergency);

      const result = await service.cancelCase("emergency-1");

      expect(result).toEqual({
        id: "emergency-1",
        title: "Car Accident",
        status: EmergencyStatus.CANCELLED,
        severity: 4,
        reportedAt: new Date("2025-01-01T00:00:00Z").toISOString(),
        patientName: "John Doe",
        contactNumber: "123-456-7890",
        emergencyType: "ACCIDENT",
        location: {
          address: "Highway 7",
          coordinates: { lat: 13.7563, lng: 100.5018 },
        },
        assignedTo: "Thonburi Hospital",
        description: "Car accident on Highway 7",
        symptoms: ["Bleeding"],
      });
    });

    it("should throw NotFoundException if emergency not found", async () => {
      mockPrismaService.emergencyRequest.findUnique.mockResolvedValue(null);

      await expect(service.cancelCase("emergency-1")).rejects.toThrow(NotFoundException);
    });
  });
});