import { Test, TestingModule } from "@nestjs/testing";
import { NotificationGateway } from "./notification.gateway";
import { JwtService } from "@nestjs/jwt";
import { AuthService } from "../auth/auth.service";
import { PrismaService } from "../prisma/prisma.service";
import { Server, Socket } from "socket.io";

describe("NotificationGateway", () => {
  let gateway: NotificationGateway;
  let jwtService: JwtService;
  let authService: AuthService;
  let prismaService: PrismaService;

  const mockJwtService = {
    verify: jest.fn(),
  };

  const mockAuthService = {
    validateToken: jest.fn(),
  };

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
    },
  };

  const mockServer = {
    to: jest.fn().mockReturnThis(),
    emit: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationGateway,
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    gateway = module.get<NotificationGateway>(NotificationGateway);
    jwtService = module.get<JwtService>(JwtService);
    authService = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);

    // Mock Socket.IO server
    gateway.server = mockServer as any;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(gateway).toBeDefined();
  });

  describe("handleConnection", () => {
    it("should handle valid connection with token", async () => {
      const mockSocket = {
        id: "socket-123",
        handshake: {
          auth: {
            token: "valid-token",
          },
        },
        join: jest.fn(),
        disconnect: jest.fn(),
        emit: jest.fn(),
      } as any;

      const mockPayload = {
        sub: "user-123",
        email: "test@example.com",
        role: "PATIENT",
      };

      const mockUser = {
        id: "user-123",
        email: "test@example.com",
        role: "PATIENT",
      };

      mockAuthService.validateToken.mockResolvedValue(mockPayload);
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      await gateway.handleConnection(mockSocket);

      expect(mockAuthService.validateToken).toHaveBeenCalledWith("valid-token");
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: "user-123" },
      });
      expect(mockSocket.join).toHaveBeenCalledWith(`user:${mockUser.id}`);
      expect(mockSocket.join).toHaveBeenCalledWith(`role:${mockUser.role}`);
      expect(mockSocket.disconnect).not.toHaveBeenCalled();
    });

    it("should disconnect socket with invalid token", async () => {
      const mockSocket = {
        id: "socket-123",
        handshake: {
          auth: {
            token: "invalid-token",
          },
        },
        disconnect: jest.fn(),
        emit: jest.fn(),
      } as any;

      mockAuthService.validateToken.mockRejectedValue(new Error("Invalid token"));

      await gateway.handleConnection(mockSocket);

      expect(mockAuthService.validateToken).toHaveBeenCalledWith("invalid-token");
      expect(mockSocket.emit).toHaveBeenCalledWith("error", { message: "Invalid or expired token" });
      expect(mockSocket.disconnect).toHaveBeenCalledWith(true);
    });

    it("should disconnect socket if user not found", async () => {
      const mockSocket = {
        id: "socket-123",
        handshake: {
          auth: {
            token: "valid-token",
          },
        },
        disconnect: jest.fn(),
        emit: jest.fn(),
      } as any;

      const mockPayload = {
        sub: "user-123",
        email: "test@example.com",
        role: "PATIENT",
      };

      mockAuthService.validateToken.mockResolvedValue(mockPayload);
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await gateway.handleConnection(mockSocket);

      expect(mockAuthService.validateToken).toHaveBeenCalledWith("valid-token");
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: "user-123" },
      });
      expect(mockSocket.emit).toHaveBeenCalledWith("error", { message: "User not found" });
      expect(mockSocket.disconnect).toHaveBeenCalledWith(true);
    });

    it("should disconnect socket if no token provided", async () => {
      const mockSocket = {
        id: "socket-123",
        handshake: {
          auth: {},
        },
        disconnect: jest.fn(),
        emit: jest.fn(),
      } as any;

      await gateway.handleConnection(mockSocket);

      expect(mockSocket.emit).toHaveBeenCalledWith("error", { message: "Missing token" });
      expect(mockSocket.disconnect).toHaveBeenCalledWith(true);
    });
  });

  describe("sendToUser", () => {
    it("should emit event to specific user", () => {
      const userId = "user-123";
      const event = "notification";
      const data = { message: "test" };

      gateway.sendToUser(userId, event, data);

      expect(gateway.server.to).toHaveBeenCalledWith(`user:${userId}`);
      expect(gateway.server.emit).toHaveBeenCalledWith(event, data);
    });
  });

  describe("sendToRole", () => {
    it("should emit event to specific role", () => {
      const role = "HOSPITAL";
      const event = "notification";
      const data = { message: "test" };

      gateway.sendToRole(role, event, data);

      expect(gateway.server.to).toHaveBeenCalledWith(`role:${role}`);
      expect(gateway.server.emit).toHaveBeenCalledWith(event, data);
    });
  });

  describe("broadcastEmergency", () => {
    it("should broadcast emergency to all relevant roles", () => {
      const data = {
        id: "emergency-123",
        type: "MEDICAL",
        grade: "HIGH",
        location: "123 Street",
        coordinates: { latitude: 123, longitude: 456 },
        assignedTo: "hospital-123",
      };

      const expectedPayload = {
        id: data.id,
        type: data.type,
        grade: data.grade,
        location: data.location,
        coordinates: data.coordinates,
        assignedTo: data.assignedTo,
      };

      gateway.broadcastEmergency(data);

      expect(gateway.server.to).toHaveBeenCalledWith("role:EMERGENCY_CENTER");
      expect(gateway.server.to).toHaveBeenCalledWith("role:HOSPITAL");
      expect(gateway.server.to).toHaveBeenCalledWith("role:RESCUE_TEAM");
      expect(gateway.server.emit).toHaveBeenCalledWith("emergency", expectedPayload);
    });
  });

  describe("broadcastStatusUpdate", () => {
    it("should broadcast status update to all relevant roles and assigned user", () => {
      const data = {
        emergencyId: "emergency-123",
        status: "ASSIGNED",
        assignedTo: "user-123",
      };

      const expectedPayload = {
        emergencyId: data.emergencyId,
        status: data.status,
        assignedTo: data.assignedTo,
      };

      gateway.broadcastStatusUpdate(data);

      expect(gateway.server.to).toHaveBeenCalledWith("role:EMERGENCY_CENTER");
      expect(gateway.server.to).toHaveBeenCalledWith("role:HOSPITAL");
      expect(gateway.server.to).toHaveBeenCalledWith("role:RESCUE_TEAM");
      expect(gateway.server.emit).toHaveBeenCalledWith("status-update", expectedPayload);
      expect(gateway.server.to).toHaveBeenCalledWith(`user:${data.assignedTo}`);
      expect(gateway.server.emit).toHaveBeenCalledWith("status-update", expectedPayload);
    });

    it("should broadcast status update without assigned user", () => {
      const data = {
        emergencyId: "emergency-123",
        status: "PENDING",
      };

      const expectedPayload = {
        emergencyId: data.emergencyId,
        status: data.status,
        assignedTo: undefined,
      };

      gateway.broadcastStatusUpdate(data);

      expect(gateway.server.to).toHaveBeenCalledWith("role:EMERGENCY_CENTER");
      expect(gateway.server.to).toHaveBeenCalledWith("role:HOSPITAL");
      expect(gateway.server.to).toHaveBeenCalledWith("role:RESCUE_TEAM");
      expect(gateway.server.emit).toHaveBeenCalledWith("status-update", expectedPayload);

      // ตรวจสอบว่าไม่มีการเรียก to ด้วย prefix "user:"
      const calls = (gateway.server.to as jest.Mock).mock.calls;
      const userCalls = calls.filter((call: string[]) => call[0].startsWith('user:'));
      expect(userCalls).toHaveLength(0);
    });
  });
});