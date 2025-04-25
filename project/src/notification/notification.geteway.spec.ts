import { Test, TestingModule } from '@nestjs/testing';
import { NotificationGateway } from './notification.gateway';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from '../auth/auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { Server, Socket } from 'socket.io';

describe('NotificationGateway', () => {
  let gateway: NotificationGateway;
  let jwtService: JwtService;
  let authService: AuthService;

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

    // Mock Socket.IO server
    gateway.server = {
      to: jest.fn().mockReturnThis(),
      emit: jest.fn(),
    } as any;
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  describe('handleConnection', () => {
    it('should handle valid connection with token', async () => {
      const mockSocket = {
        id: 'socket-123',
        handshake: {
          auth: {
            token: 'valid-token',
          },
        },
        join: jest.fn(),
        disconnect: jest.fn(),
      } as any;

      const mockUser = {
        id: 'user-123',
        role: 'PATIENT',
      };

      mockAuthService.validateToken.mockResolvedValue(mockUser);

      await gateway.handleConnection(mockSocket);

      expect(mockSocket.join).toHaveBeenCalledWith(`user:${mockUser.id}`);
      expect(mockSocket.join).toHaveBeenCalledWith(`role:${mockUser.role}`);
    });

    it('should disconnect socket with invalid token', async () => {
      const mockSocket = {
        id: 'socket-123',
        handshake: {
          auth: {
            token: 'invalid-token',
          },
        },
        disconnect: jest.fn(),
      } as any;

      mockAuthService.validateToken.mockRejectedValue(new Error('Invalid token'));

      await gateway.handleConnection(mockSocket);

      expect(mockSocket.disconnect).toHaveBeenCalled();
    });
  });

  describe('sendToUser', () => {
    it('should emit event to specific user', () => {
      const userId = 'user-123';
      const event = 'notification';
      const data = { message: 'test' };

      gateway.sendToUser(userId, event, data);

      expect(gateway.server.to).toHaveBeenCalledWith(`user:${userId}`);
      expect(gateway.server.emit).toHaveBeenCalledWith(event, data);
    });
  });

  describe('broadcastEmergency', () => {
    it('should broadcast emergency to all relevant roles', () => {
      const data = {
        id: 'emergency-123',
        type: 'MEDICAL',
      };

      gateway.broadcastEmergency(data);

      expect(gateway.server.to).toHaveBeenCalledWith('role:EMERGENCY_CENTER');
      expect(gateway.server.to).toHaveBeenCalledWith('role:HOSPITAL');
      expect(gateway.server.to).toHaveBeenCalledWith('role:RESCUE_TEAM');
      expect(gateway.server.emit).toHaveBeenCalledWith('emergency', data);
    });
  });
});