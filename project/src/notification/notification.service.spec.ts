import { Test, TestingModule } from "@nestjs/testing";
import { NotificationService } from "./notification.service";
import { NotificationGateway } from "./notification.gateway";
import { PrismaService } from "../prisma/prisma.service";
import { NotFoundException } from "@nestjs/common";

describe("NotificationService", () => {
  let service: NotificationService;
  let prismaService: PrismaService;
  let notificationGateway: NotificationGateway;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
    },
    notification: {
      create: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      delete: jest.fn(),
    },
  };

  const mockNotificationGateway = {
    sendToUser: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: NotificationGateway,
          useValue: mockNotificationGateway,
        },
      ],
    }).compile();

    service = module.get<NotificationService>(NotificationService);
    prismaService = module.get<PrismaService>(PrismaService);
    notificationGateway = module.get<NotificationGateway>(NotificationGateway);
  });

  // แก้ไข: ลบ afterEach ที่เคลียร์ mock ทั้งหมด และย้ายไปเคลียร์ในแต่ละ test case ถ้าจำเป็น
  // afterEach(() => {
  //   jest.clearAllMocks();
  // });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("createNotification", () => {
    const createDto = {
      type: "EMERGENCY",
      title: "New Emergency",
      body: "Emergency request received",
      userId: "user-123",
      metadata: { emergencyId: "emergency-123" },
    };

    beforeEach(() => {
      jest.clearAllMocks(); // เคลียร์ mock เฉพาะก่อน test case นี้
    });

    it("should create notification and send via WebSocket", async () => {
      const mockUser = { id: "user-123", email: "test@example.com" };
      const mockNotification = {
        id: "notification-123",
        ...createDto,
        isRead: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.notification.create.mockResolvedValue(mockNotification);

      const result = await service.createNotification(createDto);

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: createDto.userId },
      });
      expect(mockPrismaService.notification.create).toHaveBeenCalledWith({
        data: {
          type: createDto.type,
          title: createDto.title,
          body: createDto.body,
          userId: createDto.userId,
          metadata: createDto.metadata,
        },
      });
      expect(mockNotificationGateway.sendToUser).toHaveBeenCalledWith(
        createDto.userId,
        "notification",
        mockNotification,
      );
      expect(result).toEqual(mockNotification);
    });

    it("should throw NotFoundException if user does not exist", async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.createNotification(createDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: createDto.userId },
      });
      expect(mockPrismaService.notification.create).not.toHaveBeenCalled();
    });
  });

  describe("markAsRead", () => {
    beforeEach(() => {
      jest.clearAllMocks(); // เคลียร์ mock เฉพาะก่อน test case นี้
    });

    it("should mark notification as read", async () => {
      const mockNotification = {
        id: "notification-123",
        userId: "user-123",
        isRead: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const updatedNotification = { ...mockNotification, isRead: true };

      mockPrismaService.notification.findFirst.mockResolvedValue(mockNotification);
      mockPrismaService.notification.update.mockResolvedValue(updatedNotification);

      const result = await service.markAsRead("notification-123", "user-123");

      expect(mockPrismaService.notification.findFirst).toHaveBeenCalledWith({
        where: { id: "notification-123", userId: "user-123" },
      });
      expect(mockPrismaService.notification.update).toHaveBeenCalledWith({
        where: { id: "notification-123" },
        data: { isRead: true },
      });
      expect(result.isRead).toBe(true);
    });

    it("should throw NotFoundException if notification not found", async () => {
      mockPrismaService.notification.findFirst.mockResolvedValue(null);

      await expect(service.markAsRead("notification-123", "user-123")).rejects.toThrow(
        NotFoundException,
      );
      expect(mockPrismaService.notification.findFirst).toHaveBeenCalledWith({
        where: { id: "notification-123", userId: "user-123" },
      });
      expect(mockPrismaService.notification.update).not.toHaveBeenCalled();
    });
  });

  describe("markAllAsRead", () => {
    beforeEach(() => {
      jest.clearAllMocks(); // เคลียร์ mock เฉพาะก่อน test case นี้
    });

    it("should mark all notifications as read for user", async () => {
      const mockNotifications = [
        { id: "notification-1", userId: "user-123", isRead: false },
        { id: "notification-2", userId: "user-123", isRead: false },
      ];
      mockPrismaService.notification.findMany.mockResolvedValue(mockNotifications);
      mockPrismaService.notification.updateMany.mockResolvedValue({ count: 2 });

      const result = await service.markAllAsRead("user-123");

      expect(mockPrismaService.notification.findMany).toHaveBeenCalledWith({
        where: { userId: "user-123", isRead: false },
      });
      expect(mockPrismaService.notification.updateMany).toHaveBeenCalledWith({
        where: { userId: "user-123", isRead: false },
        data: { isRead: true },
      });
      expect(result).toEqual({ count: 2 });
    });

    it("should return message if no unread notifications", async () => {
      mockPrismaService.notification.findMany.mockResolvedValue([]);

      const result = await service.markAllAsRead("user-123");

      expect(mockPrismaService.notification.findMany).toHaveBeenCalledWith({
        where: { userId: "user-123", isRead: false },
      });
      expect(mockPrismaService.notification.updateMany).not.toHaveBeenCalled();
      expect(result).toEqual({ message: 'No unread notifications to mark as read' });
    });
  });

  describe("findAll", () => {
    beforeEach(() => {
      jest.clearAllMocks(); // เคลียร์ mock เฉพาะก่อน test case นี้
    });

    it("should return all notifications for user", async () => {
      const mockNotifications = [
        { id: "notification-1", userId: "user-123", isRead: false },
        { id: "notification-2", userId: "user-123", isRead: true },
      ];
      mockPrismaService.notification.findMany.mockResolvedValue(mockNotifications);

      const result = await service.findAll("user-123");

      expect(mockPrismaService.notification.findMany).toHaveBeenCalledWith({
        where: { userId: "user-123" },
        orderBy: { createdAt: "desc" },
      });
      expect(result).toEqual(mockNotifications);
    });
  });

  describe("deleteNotification", () => {
    beforeEach(() => {
      jest.clearAllMocks(); // เคลียร์ mock เฉพาะก่อน test case นี้
    });

    it("should delete notification", async () => {
      const mockNotification = {
        id: "notification-123",
        userId: "user-123",
        isRead: false,
      };
      mockPrismaService.notification.findFirst.mockResolvedValue(mockNotification);
      mockPrismaService.notification.delete.mockResolvedValue(mockNotification);

      const result = await service.deleteNotification("notification-123", "user-123");

      expect(mockPrismaService.notification.findFirst).toHaveBeenCalledWith({
        where: { id: "notification-123", userId: "user-123" },
      });
      expect(mockPrismaService.notification.delete).toHaveBeenCalledWith({
        where: { id: "notification-123" },
      });
      expect(result).toEqual(mockNotification);
    });

    it("should throw NotFoundException if notification not found", async () => {
      mockPrismaService.notification.findFirst.mockResolvedValue(null);

      await expect(service.deleteNotification("notification-123", "user-123")).rejects.toThrow(
        NotFoundException,
      );
      expect(mockPrismaService.notification.findFirst).toHaveBeenCalledWith({
        where: { id: "notification-123", userId: "user-123" },
      });
      expect(mockPrismaService.notification.delete).not.toHaveBeenCalled();
    });
  });
});