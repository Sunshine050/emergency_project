import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';
import { HttpStatus, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { RegisterDto, LoginDto, OAuthLoginDto, RefreshTokenDto } from './dto/auth.dto';
import { Response } from 'express';

describe('AuthController', () => {
  let controller: AuthController;
  let mockAuthService: any;
  let mockConfigService: any;

  beforeEach(async () => {
    mockAuthService = {
      register: jest.fn(),
      login: jest.fn(),
      generateAuthUrl: jest.fn(),
      handleOAuthCallback: jest.fn(),
      loginWithSupabaseToken: jest.fn(),
      refreshToken: jest.fn(),
    };

    mockConfigService = {
      get: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const registerDto: RegisterDto = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        phone: '1234567890',
        role: 'ADMIN',
      };
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        phone: '1234567890',
        role: 'ADMIN',
        status: 'ACTIVE',
        supabaseUserId: null,
      };
      mockAuthService.register.mockResolvedValue(mockUser);

      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;

      await controller.register(registerDto, mockResponse);

      expect(mockAuthService.register).toHaveBeenCalledWith(registerDto);
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.CREATED);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Registration successful',
        user: mockUser,
      });
    });

    it('should return 409 if email already exists', async () => {
      const registerDto: RegisterDto = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        phone: '1234567890',
        role: 'ADMIN',
      };
      mockAuthService.register.mockRejectedValue({
        status: 409,
        message: 'This email is already in use',
      });

      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;

      await controller.register(registerDto, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Registration failed',
        error: 'This email is already in use',
      });
    });

    it('should return 400 for other registration errors', async () => {
      const registerDto: RegisterDto = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        phone: '1234567890',
        role: 'ADMIN',
      };
      mockAuthService.register.mockRejectedValue(new Error('Invalid data'));

      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;

      await controller.register(registerDto, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Registration failed',
        error: 'Invalid data',
      });
    });
  });

  describe('login', () => {
    it('should login successfully', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password123',
      };
      const authResult = {
        access_token: 'access-token',
        refresh_token: 'refresh-token',
        token_type: 'Bearer',
        expires_in: 900,
      };
      mockAuthService.login.mockResolvedValue(authResult);

      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;

      await controller.login(loginDto, mockResponse);

      expect(mockAuthService.login).toHaveBeenCalledWith(loginDto);
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Login successful',
        access_token: 'access-token',
        refresh_token: 'refresh-token',
        token_type: 'Bearer',
        expires_in: 900,
      });
    });

    it('should return 401 for invalid credentials', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'wrong-password',
      };
      mockAuthService.login.mockRejectedValue(new UnauthorizedException('Invalid email or password'));

      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;

      await controller.login(loginDto, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Login failed',
        error: 'Invalid email or password',
      });
    });
  });

  describe('oauthLogin', () => {
    it('should generate OAuth URL successfully', async () => {
      const oauthLoginDto: OAuthLoginDto = { provider: 'google' };
      const authUrl = 'https://supabase.co/auth/v1/authorize?provider=google';
      mockAuthService.generateAuthUrl.mockResolvedValue(authUrl);

      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;

      await controller.oauthLogin(oauthLoginDto, mockResponse);

      expect(mockAuthService.generateAuthUrl).toHaveBeenCalledWith('google');
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockResponse.json).toHaveBeenCalledWith({ url: authUrl });
    });

    it('should return 400 if provider is missing', async () => {
      const oauthLoginDto: OAuthLoginDto = { provider: '' };
      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;

      await controller.oauthLogin(oauthLoginDto, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Provider is required',
      });
    });
  });

  describe('oauthCallback', () => {
    it('should handle OAuth callback with code successfully', async () => {
      const authResult = {
        access_token: 'access-token',
        refresh_token: 'refresh-token',
        token_type: 'Bearer',
        expires_in: 900,
      };
      mockAuthService.handleOAuthCallback.mockResolvedValue(authResult);

      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;

      await controller.oauthCallback('google', 'auth-code', undefined, mockResponse);

      expect(mockAuthService.handleOAuthCallback).toHaveBeenCalledWith('google', 'auth-code');
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'OAuth callback successful',
        access_token: 'access-token',
        refresh_token: 'refresh-token',
        token_type: 'Bearer',
        expires_in: 900,
      });
    });

    it('should handle OAuth callback with access token successfully', async () => {
      const authResult = {
        access_token: 'access-token',
        refresh_token: 'refresh-token',
        token_type: 'Bearer',
        expires_in: 900,
      };
      mockAuthService.loginWithSupabaseToken.mockResolvedValue(authResult);

      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;

      await controller.oauthCallback('google', undefined, 'access-token', mockResponse);

      expect(mockAuthService.loginWithSupabaseToken).toHaveBeenCalledWith('access-token');
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'OAuth callback successful',
        access_token: 'access-token',
        refresh_token: 'refresh-token',
        token_type: 'Bearer',
        expires_in: 900,
      });
    });

    it('should return 400 if provider is missing', async () => {
      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;

      await controller.oauthCallback('', 'auth-code', undefined, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Missing provider in callback',
      });
    });

    it('should return 400 if code and access_token are missing', async () => {
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

    it('should return 401 if OAuth callback fails', async () => {
      mockAuthService.handleOAuthCallback.mockRejectedValue(new UnauthorizedException('Cannot authenticate with provider'));

      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;

      await controller.oauthCallback('google', 'auth-code', undefined, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Cannot authenticate with provider',
        error: 'Cannot authenticate with provider',
      });
    });
  });

  describe('refreshToken', () => {
    it('should refresh token successfully', async () => {
      const refreshTokenDto: RefreshTokenDto = { refreshToken: 'refresh-token' };
      const authResult = {
        access_token: 'new-access-token',
        refresh_token: 'new-refresh-token',
        token_type: 'Bearer',
        expires_in: 900,
      };
      mockAuthService.refreshToken.mockResolvedValue(authResult);

      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;

      await controller.refreshToken(refreshTokenDto, mockResponse);

      expect(mockAuthService.refreshToken).toHaveBeenCalledWith('refresh-token');
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Token refreshed successfully',
        access_token: 'new-access-token',
        refresh_token: 'new-refresh-token',
        token_type: 'Bearer',
        expires_in: 900,
      });
    });

    it('should return 400 for missing refresh token', async () => {
      const refreshTokenDto: RefreshTokenDto = { refreshToken: '' };
      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;

      await controller.refreshToken(refreshTokenDto, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Cannot refresh token',
        error: 'Refresh token is required',
      });
    });

    it('should return 400 for invalid refresh token', async () => {
      const refreshTokenDto: RefreshTokenDto = { refreshToken: 'invalid-token' };
      mockAuthService.refreshToken.mockRejectedValue(new UnauthorizedException('Invalid refresh token'));

      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;

      await controller.refreshToken(refreshTokenDto, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Cannot refresh token',
        error: 'Invalid refresh token',
      });
    });
  });

  describe('supabaseLogin', () => {
    it('should login with Supabase token successfully', async () => {
      const body = { access_token: 'supabase-token' };
      const authResult = {
        access_token: 'access-token',
        refresh_token: 'refresh-token',
        token_type: 'Bearer',
        expires_in: 900,
      };
      mockAuthService.loginWithSupabaseToken.mockResolvedValue(authResult);

      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;

      await controller.supabaseLogin(body, mockResponse);

      expect(mockAuthService.loginWithSupabaseToken).toHaveBeenCalledWith('supabase-token');
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Supabase login successful',
        access_token: 'access-token',
        refresh_token: 'refresh-token',
        token_type: 'Bearer',
        expires_in: 900,
      });
    });

    it('should return 400 for missing access token', async () => {
      const body = { access_token: '' };
      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;

      await controller.supabaseLogin(body, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Cannot login with Supabase token',
        error: 'Access token is required',
      });
    });

    it('should return 400 for invalid Supabase token', async () => {
      const body = { access_token: 'invalid-token' };
      mockAuthService.loginWithSupabaseToken.mockRejectedValue(new UnauthorizedException('Cannot validate token'));

      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;

      await controller.supabaseLogin(body, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Cannot login with Supabase token',
        error: 'Cannot validate token',
      });
    });
  });

  describe('getProfile', () => {
    it('should return user profile', async () => {
      const mockRequest = {
        user: { id: 'user-123', email: 'test@example.com', role: 'PATIENT' },
      } as any;

      const result = controller.getProfile(mockRequest);

      expect(result).toEqual({
        message: 'User profile retrieved',
        user: mockRequest.user,
      });
    });
  });

  describe('verifyToken', () => {
    it('should verify token successfully', async () => {
      const mockRequest = {
        user: { id: 'user-123', email: 'test@example.com', role: 'PATIENT' },
      } as any;

      const result = await controller.verifyToken(mockRequest);

      expect(result).toEqual({
        message: 'Token is valid',
        user: mockRequest.user,
      });
    });
  });
});