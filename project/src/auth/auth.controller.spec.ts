import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { Response } from 'express';
import { UnauthorizedException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    generateAuthUrl: jest.fn(),
    handleOAuthCallback: jest.fn(),
    refreshToken: jest.fn(),
    login: jest.fn(),
    findOrCreateUser: jest.fn(),
    getUserFromAccessToken: jest.fn(),
    signJwt: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn().mockImplementation((key: string) => {
      if (key === 'SUPABASE_URL') return 'https://mock.supabase.co';
      if (key === 'SUPABASE_SERVICE_ROLE_KEY') return 'mock-key';
      if (key === 'JWT_EXPIRES_IN') return '604800';
      return null;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('oauthLogin', () => {
    it('should generate auth URL for valid provider', async () => {
      const mockUrl = 'https://auth.provider.com/oauth';
      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;

      mockAuthService.generateAuthUrl.mockResolvedValue(mockUrl);

      await controller.oauthLogin({ provider: 'google' }, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({ url: mockUrl });
    });

    it('should throw UnauthorizedException for invalid provider', async () => {
      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;

      mockAuthService.generateAuthUrl.mockRejectedValue(new UnauthorizedException('Invalid provider'));

      await expect(
        controller.oauthLogin({ provider: 'invalid' }, mockResponse),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('oauthCallback', () => {
    it('should handle successful callback with code (Authorization Code Flow)', async () => {
      const mockAuthResult = {
        access_token: 'token-123',
        refresh_token: 'refresh-token-123',
        token_type: 'Bearer',
        expires_in: 3600,
      };

      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;

      mockAuthService.handleOAuthCallback.mockResolvedValue(mockAuthResult);

      await controller.oauthCallback('google', 'auth-code', undefined, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'OAuth callback successful',
        access_token: mockAuthResult.access_token,
        refresh_token: mockAuthResult.refresh_token,
        token_type: mockAuthResult.token_type,
        expires_in: mockAuthResult.expires_in,
      });
    });

    it('should handle successful callback with access_token (Implicit Flow)', async () => {
      const mockSupabaseUser = {
        id: 'supabase-user-id',
        email: 'user@example.com',
      };

      const mockUser = {
        id: 'user-id',
        email: 'user@example.com',
        role: 'PATIENT',
      };

      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;

      mockAuthService.getUserFromAccessToken.mockResolvedValue(mockSupabaseUser);
      mockAuthService.findOrCreateUser.mockResolvedValue(mockUser);
      mockAuthService.signJwt.mockReturnValue('jwt-token');

      await controller.oauthCallback('google', undefined, 'access-token', mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'OAuth callback successful',
        access_token: 'jwt-token',
        refresh_token: '',
        token_type: 'Bearer',
        expires_in: 604800,
      });
    });

    it('should return 400 if provider is missing', async () => {
      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;

      await controller.oauthCallback(undefined, undefined, undefined, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Missing provider in callback',
      });
    });

    it('should return 400 if both code and access_token are missing', async () => {
      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;

      await controller.oauthCallback('google', undefined, undefined, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Missing code or access_token in callback',
      });
    });

    it('should handle invalid callback and return 401', async () => {
      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;

      mockAuthService.handleOAuthCallback.mockRejectedValue(new Error('Invalid code'));

      await controller.oauthCallback('google', 'invalid', undefined, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Cannot authenticate with provider',
        error: 'Invalid code',
      });
    });
  });

  describe('refreshToken', () => {
    it('should refresh token successfully', async () => {
      const mockRefreshResult = {
        access_token: 'new-token-123',
      };

      mockAuthService.refreshToken.mockResolvedValue(mockRefreshResult);

      const result = await controller.refreshToken('valid-refresh-token');

      expect(result).toEqual(mockRefreshResult);
    });

    it('should throw UnauthorizedException for invalid refresh token', async () => {
      mockAuthService.refreshToken.mockRejectedValue(new UnauthorizedException('Invalid refresh token'));

      await expect(
        controller.refreshToken('invalid-refresh-token'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});