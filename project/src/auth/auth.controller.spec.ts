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
  };

  const mockConfigService = {
    get: jest.fn().mockImplementation((key: string) => {
      if (key === 'SUPABASE_URL') return 'https://mock.supabase.co';
      if (key === 'SUPABASE_SERVICE_ROLE_KEY') return 'mock-key';
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
    it('should handle successful callback', async () => {
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

      await controller.oauthCallback('google', 'auth-code', mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'OAuth callback สำเร็จ',
        access_token: mockAuthResult.access_token,
        refresh_token: mockAuthResult.refresh_token,
        token_type: mockAuthResult.token_type,
        expires_in: mockAuthResult.expires_in,
      });
    });

    it('should handle invalid callback and return 401', async () => {
      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;

      mockAuthService.handleOAuthCallback.mockRejectedValue(new Error('Invalid code'));

      await controller.oauthCallback('google', 'invalid', mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'ไม่สามารถยืนยันตัวตนกับ provider',
        error: 'Invalid code',
      });
    });
  });

  describe('refreshToken', () => {
    it('should refresh token successfully', async () => {
      const mockRefreshResult = {
        access_token: 'new-token-123',
        refresh_token: 'new-refresh-token-123',
        token_type: 'Bearer',
        expires_in: 3600,
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