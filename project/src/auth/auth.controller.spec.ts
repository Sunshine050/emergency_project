import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { Response } from 'express';
import { UnauthorizedException, HttpStatus, BadRequestException } from '@nestjs/common';
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
    loginWithSupabaseToken: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn().mockImplementation((key: string) => {
      if (key === 'SUPABASE_URL') return 'https://mock.supabase.co';
      if (key === 'SUPABASE_SERVICE_ROLE_KEY') return 'mock-key';
      if (key === 'JWT_EXPIRES_IN') return '900';
      if (key === 'JWT_REFRESH_EXPIRES_IN') return '604800';
      return null;
    }),
  };

  const mockResponse = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  } as unknown as Response;

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

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('oauthLogin', () => {
    it('should generate auth URL for valid provider', async () => {
      const mockUrl = 'https://auth.provider.com/oauth';
      mockAuthService.generateAuthUrl.mockResolvedValue(mockUrl);

      await controller.oauthLogin({ provider: 'google' }, mockResponse);

      expect(mockAuthService.generateAuthUrl).toHaveBeenCalledWith('google');
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockResponse.json).toHaveBeenCalledWith({ url: mockUrl });
    });

    it('should return 400 for missing provider', async () => {
      await controller.oauthLogin({ provider: '' }, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Provider is required',
      });
    });

    it('should return 400 for invalid provider', async () => {
      mockAuthService.generateAuthUrl.mockRejectedValue(new BadRequestException('Unsupported provider: invalid'));

      await controller.oauthLogin({ provider: 'invalid' }, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Cannot initiate OAuth login',
        error: 'Unsupported provider: invalid',
      });
    });
  });

  describe('oauthCallback', () => {
    it('should handle successful callback with code (Authorization Code Flow)', async () => {
      const mockAuthResult = {
        access_token: 'token-123',
        refresh_token: 'refresh-token-123',
        token_type: 'Bearer',
        expires_in: 900,
      };

      mockAuthService.handleOAuthCallback.mockResolvedValue(mockAuthResult);

      await controller.oauthCallback('google', 'auth-code', undefined, mockResponse);

      expect(mockAuthService.handleOAuthCallback).toHaveBeenCalledWith('google', 'auth-code');
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'OAuth callback successful',
        access_token: mockAuthResult.access_token,
        refresh_token: mockAuthResult.refresh_token,
        token_type: mockAuthResult.token_type,
        expires_in: mockAuthResult.expires_in,
      });
    });

    it('should handle successful callback with access_token (Implicit Flow)', async () => {
      const mockAuthResult = {
        access_token: 'jwt-token',
        refresh_token: 'refresh-token',
        token_type: 'Bearer',
        expires_in: 900,
      };

      mockAuthService.loginWithSupabaseToken.mockResolvedValue(mockAuthResult);

      await controller.oauthCallback('google', undefined, 'access-token', mockResponse);

      expect(mockAuthService.loginWithSupabaseToken).toHaveBeenCalledWith('access-token');
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'OAuth callback successful',
        access_token: mockAuthResult.access_token,
        refresh_token: mockAuthResult.refresh_token,
        token_type: mockAuthResult.token_type,
        expires_in: mockAuthResult.expires_in,
      });
    });

    it('should return 400 if provider is missing', async () => {
      await controller.oauthCallback(undefined, undefined, undefined, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Missing provider in callback',
      });
    });

    it('should return 400 if both code and access_token are missing', async () => {
      await controller.oauthCallback('google', undefined, undefined, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Missing code or access_token in callback',
      });
    });

    it('should return 401 for invalid callback', async () => {
      mockAuthService.handleOAuthCallback.mockRejectedValue(new UnauthorizedException('Invalid code'));

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
        refresh_token: 'new-refresh-token-123',
        token_type: 'Bearer',
        expires_in: 900,
      };

      mockAuthService.refreshToken.mockResolvedValue(mockRefreshResult);

      await controller.refreshToken({ refreshToken: 'valid-refresh-token' }, mockResponse);

      expect(mockAuthService.refreshToken).toHaveBeenCalledWith('valid-refresh-token');
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Token refreshed successfully',
        access_token: mockRefreshResult.access_token,
        refresh_token: mockRefreshResult.refresh_token,
        token_type: mockRefreshResult.token_type,
        expires_in: mockRefreshResult.expires_in,
      });
    });

    it('should return 400 for missing refresh token', async () => {
      await controller.refreshToken({ refreshToken: '' }, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Refresh token is required',
      });
    });

    it('should return 401 for invalid refresh token', async () => {
      mockAuthService.refreshToken.mockRejectedValue(new UnauthorizedException('Invalid refresh token'));

      await controller.refreshToken({ refreshToken: 'invalid-refresh-token' }, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Cannot refresh token',
        error: 'Invalid refresh token',
      });
    });
  });

  describe('login', () => {
    it('should login successfully', async () => {
      const mockLoginResult = {
        access_token: 'token-123',
        refresh_token: 'refresh-token-123',
        token_type: 'Bearer',
        expires_in: 900,
      };

      mockAuthService.login.mockResolvedValue(mockLoginResult);

      await controller.login({ email: 'test@example.com', password: 'password' }, mockResponse);

      expect(mockAuthService.login).toHaveBeenCalledWith({ email: 'test@example.com', password: 'password' });
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Login successful',
        access_token: mockLoginResult.access_token,
        refresh_token: mockLoginResult.refresh_token,
        token_type: mockLoginResult.token_type,
        expires_in: mockLoginResult.expires_in,
      });
    });

    it('should return 401 for invalid credentials', async () => {
      mockAuthService.login.mockRejectedValue(new UnauthorizedException('Invalid email or password'));

      await controller.login({ email: 'test@example.com', password: 'wrong' }, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Login failed',
        error: 'Invalid email or password',
      });
    });
  });

  describe('supabaseLogin', () => {
    it('should login with Supabase token successfully', async () => {
      const mockLoginResult = {
        access_token: 'supabase-token-123',
        refresh_token: 'supabase-refresh-token-123',
        token_type: 'Bearer',
        expires_in: 900,
      };

      mockAuthService.loginWithSupabaseToken.mockResolvedValue(mockLoginResult);

      await controller.supabaseLogin({ access_token: 'supabase-access-token' }, mockResponse);

      expect(mockAuthService.loginWithSupabaseToken).toHaveBeenCalledWith('supabase-access-token');
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Supabase login successful',
        access_token: mockLoginResult.access_token,
        refresh_token: mockLoginResult.refresh_token,
        token_type: mockLoginResult.token_type,
        expires_in: mockLoginResult.expires_in,
      });
    });

    it('should return 400 for missing access token', async () => {
      await controller.supabaseLogin({ access_token: '' }, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Access token is required',
      });
    });

    it('should return 401 for invalid Supabase token', async () => {
      mockAuthService.loginWithSupabaseToken.mockRejectedValue(new UnauthorizedException('Invalid Supabase token'));

      await controller.supabaseLogin({ access_token: 'invalid-token' }, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Cannot login with Supabase token',
        error: 'Invalid Supabase token',
      });
    });
  });
});