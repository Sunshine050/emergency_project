import { Test, TestingModule } from '@nestjs/testing';
import { HospitalService } from './hospital.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationService } from '../notification/notification.service';

describe('HospitalService', () => {
  let service: HospitalService;
  let prismaService: PrismaService;
  let notificationService: NotificationService;

  const mockPrismaService = {
    organization: {
      create: jest.fn(),
    },
  };

  const mockNotificationService = {
    createNotification: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HospitalService,
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

    service = module.get<HospitalService>(HospitalService);
    prismaService = module.get<PrismaService>(PrismaService);
    notificationService = module.get<NotificationService>(NotificationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a hospital successfully', async () => {
      const createDto = {
        name: 'Test Hospital',
        address: '123 Test St',
        city: 'Test City',
        postalCode: '12345',
        contactPhone: '123-456-7890',
        latitude: 13.7563,
        longitude: 100.5018,
      };

      const mockHospital = {
        id: 'hospital-123',
        ...createDto,
        type: 'HOSPITAL',
        status: 'ACTIVE',
      };

      mockPrismaService.organization.create.mockResolvedValue(mockHospital);

      const result = await service.create(createDto);

      expect(result).toEqual(mockHospital);
      expect(mockPrismaService.organization.create).toHaveBeenCalledWith({
        data: {
          ...createDto,
          type: 'HOSPITAL',
        },
      });
    });
  });
});