import { Test, TestingModule } from '@nestjs/testing';
import { SosService } from './sos.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationService } from '../notification/notification.service';
import { NotificationGateway } from '../notification/notification.gateway';
import { EmergencyGrade, EmergencyType, EmergencyStatus } from './dto/sos.dto';

describe('SosService', () => {
  let service: SosService;
  let prismaService: PrismaService;
  let notificationService: NotificationService;
  let notificationGateway: NotificationGateway;

  const mockPrismaService = {
    emergencyRequest: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    user: {
      findMany: jest.fn(),
    },
  };

  const mockNotificationService = {
    createNotification: jest.fn(),
  };

  const mockNotificationGateway = {
    broadcastEmergency: jest.fn().mockResolvedValue(undefined),
    broadcastStatusUpdate: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SosService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: NotificationService,
          useValue: mockNotificationService,
        },
        {
          provide: NotificationGateway,
          useValue: mockNotificationGateway,
        },
      ],
    }).compile();

    service = module.get<SosService>(SosService);
    prismaService = module.get<PrismaService>(PrismaService);
    notificationService = module.get<NotificationService>(NotificationService);
    notificationGateway = module.get<NotificationGateway>(NotificationGateway);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createEmergencyRequest', () => {
    const mockEmergencyRequest = {
      description: 'Test emergency',
      latitude: 13.7563,
      longitude: 100.5018,
      grade: EmergencyGrade.URGENT,
      type: EmergencyType.MEDICAL,
      medicalInfo: {
        bloodType: 'A+',
        allergies: ['penicillin'],
      },
    };

    const mockUserId = 'user-123';

    it('should create an emergency request and notify responders', async () => {
      const mockCreatedRequest = {
        id: 'emergency-123',
        ...mockEmergencyRequest,
        status: EmergencyStatus.PENDING,
        patientId: mockUserId,
        patient: {
          id: mockUserId,
          firstName: 'John',
          lastName: 'Doe',
        },
      };

      const mockResponders = [
        { id: 'responder-1', role: 'EMERGENCY_CENTER', status: 'ACTIVE' },
        { id: 'responder-2', role: 'HOSPITAL', status: 'ACTIVE' },
      ];

      mockPrismaService.emergencyRequest.create.mockResolvedValue(mockCreatedRequest);
      mockPrismaService.user.findMany.mockResolvedValue(mockResponders);
      mockNotificationService.createNotification
        .mockResolvedValueOnce({ id: 'notif-1' })
        .mockResolvedValueOnce({ id: 'notif-2' });

      const result = await service.createEmergencyRequest(mockEmergencyRequest, mockUserId);

      expect(result).toEqual(mockCreatedRequest);
      expect(mockPrismaService.emergencyRequest.create).toHaveBeenCalled();
      expect(mockPrismaService.user.findMany).toHaveBeenCalled();
      expect(mockNotificationService.createNotification).toHaveBeenCalledTimes(mockResponders.length);
      expect(mockNotificationGateway.broadcastEmergency).toHaveBeenCalledWith({
        id: mockCreatedRequest.id,
        type: mockEmergencyRequest.type,
        grade: mockEmergencyRequest.grade,
        coordinates: {
          latitude: mockEmergencyRequest.latitude,
          longitude: mockEmergencyRequest.longitude,
        },
      });
    });
  });
});
