import { Test, TestingModule } from '@nestjs/testing';
import { NotificationService } from './notification.service';
import { NotificationGateway } from './notification.gateway';
import { PrismaService } from '../prisma/prisma.service';

describe('NotificationService', () => {
  let service: NotificationService;
  let prismaService: PrismaService;
  let notificationGateway: NotificationGateway;

  const mockPrismaService = {
    notification: {
      create: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
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

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createNotification', () => {
    const createDto = {
      type: 'EMERGENCY',
      title: 'New Emergency',
      body: 'Emergency request received',
      userId: 'user-123',
      metadata: { emergencyId: 'emergency-123' },
    };

    it('should create notification and send via WebSocket', async () => {
      const mockNotification = {
        id: 'notification-123',
        ...createDto,
        isRead: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.notification.create.mockResolvedValue(mockNotification);

      const result = await service.createNotification(createDto);

      expect(result).toEqual(mockNotification);
      expect(mockNotificationGateway.sendToUser).toHaveBeenCalledWith(
        createDto.userId,
        'notification',
        mockNotification,
      );
    });
  });

  describe('markAsRead', () => {
    it('should mark notification as read', async () => {
      const mockNotification = {
        id: 'notification-123',
        isRead: true,
        updatedAt: new Date(),
      };

      mockPrismaService.notification.update.mockResolvedValue(mockNotification);

      const result = await service.markAsRead('notification-123', 'user-123');
      expect(result.isRead).toBe(true);
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all notifications as read for user', async () => {
      mockPrismaService.notification.updateMany.mockResolvedValue({ count: 5 });

      await service.markAllAsRead('user-123');

      expect(mockPrismaService.notification.updateMany).toHaveBeenCalledWith({
        where: {
          userId: 'user-123',
          isRead: false,
        },
        data: {
          isRead: true,
        },
      });
    });
  });
});
