import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { UnauthorizedException, InternalServerErrorException, BadRequestException, ConflictException } from '@nestjs/common';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { SupabaseUser, TokenPayload, AuthTokens } from '../common/interfaces/auth.interface';
import { UserRole, UserStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn().mockReturnValue({
    auth: {
      signInWithOAuth: jest.fn(),
      exchangeCodeForSession: jest.fn(),
      getUser: jest.fn(),
      refreshSession: jest.fn(),
    },
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    limit: jest.fn().mockResolvedValue({ data: [], error: null }),
  }),
}));

describe('AuthService', () => {
  let service: AuthService;
  let mockConfigService: any;
  let mockJwtService: any;
  let mockPrismaService: any;

  beforeEach(async () => {
    mockConfigService = {
      get: jest.fn().mockImplementation((key: string) => {
        const config = {
          SUPABASE_URL: 'https://example.supabase.co',
          SUPABASE_SERVICE_ROLE_KEY: 'service-key',
          JWT_SECRET: 'jwt-secret',
          JWT_REFRESH_SECRET: 'refresh-secret',
          JWT_EXPIRES_IN: '15m',
          JWT_REFRESH_EXPIRES_IN: '7d',
          OAUTH_REDIRECT_URL: 'http://localhost:3000/auth/callback',
        };
        return config[key] || '900';
      }),
    };

    mockJwtService = {
      sign: jest.fn(),
      verify: jest.fn(),
    };

    mockPrismaService = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: ConfigService, useValue: mockConfigService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('testSupabaseConnection', () => {
    it('should test Supabase connection successfully', async () => {
      const result = await service.testSupabaseConnection();
      expect(result).toEqual({ data: [], error: null });
    });

    it('should throw InternalServerErrorException if Supabase connection fails', async () => {
      const mockSupabaseClient = require('@supabase/supabase-js').createClient();
      mockSupabaseClient.from().select().limit.mockResolvedValue({
        data: null,
        error: { message: 'Connection failed' },
      });

      await expect(service.testSupabaseConnection()).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const registerDto: RegisterDto = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        phone: '1234567890',
        role: UserRole.ADMIN,
      };
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        password: 'hashed-password',
        firstName: 'John',
        lastName: 'Doe',
        phone: '1234567890',
        role: UserRole.ADMIN,
        status: UserStatus.ACTIVE,
      };

      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue(mockUser);

      const result = await service.register(registerDto);

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: {
          email: 'test@example.com',
          password: 'hashed-password',
          firstName: 'John',
          lastName: 'Doe',
          phone: '1234567890',
          role: UserRole.ADMIN,
          status: UserStatus.ACTIVE,
        },
      });
      expect(result).toEqual(mockUser);
    });

    it('should throw ConflictException if email already exists', async () => {
      const registerDto: RegisterDto = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        phone: '1234567890',
        role: UserRole.ADMIN,
      };
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'user-123',
        email: 'test@example.com',
      });

      await expect(service.register(registerDto)).rejects.toThrow(ConflictException);
    });

    it('should throw BadRequestException for invalid role', async () => {
      const registerDto: RegisterDto = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        phone: '1234567890',
        role: UserRole.PATIENT,
      };

      await expect(service.register(registerDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('login', () => {
    it('should login successfully', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password123',
      };
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        password: 'hashed-password',
        role: UserRole.ADMIN,
        status: UserStatus.ACTIVE,
      };
      const authResult = {
        access_token: 'access-token',
        refresh_token: 'refresh-token',
        token_type: 'Bearer',
        expires_in: 900,
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwtService.sign
        .mockReturnValueOnce('access-token')
        .mockReturnValueOnce('refresh-token');

      const result = await service.login(loginDto);

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
        select: {
          id: true,
          email: true,
          password: true,
          role: true,
          status: true,
        },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashed-password');
      expect(mockJwtService.sign).toHaveBeenCalledTimes(2);
      expect(result).toEqual(authResult);
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'wrong-password',
      };
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        password: 'hashed-password',
        role: UserRole.ADMIN,
        status: UserStatus.ACTIVE,
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for inactive user', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password123',
      };
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        password: 'hashed-password',
        role: UserRole.ADMIN,
        status: UserStatus.INACTIVE,
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('generateAuthUrl', () => {
    it('should generate OAuth URL successfully', async () => {
      const mockSupabaseClient = require('@supabase/supabase-js').createClient();
      mockSupabaseClient.auth.signInWithOAuth.mockResolvedValue({
        data: { url: 'https://supabase.co/auth/v1/authorize?provider=google' },
        error: null,
      });

      const url = await service.generateAuthUrl('google');

      expect(mockSupabaseClient.auth.signInWithOAuth).toHaveBeenCalledWith({
        provider: 'google',
        options: {
          redirectTo: 'http://localhost:3000/auth/callback',
          queryParams: {
            response_type: 'code',
            access_type: 'offline',
          },
        },
      });
      expect(url).toBe('https://supabase.co/auth/v1/authorize?provider=google');
    });

    it('should throw BadRequestException for unsupported provider', async () => {
      await expect(service.generateAuthUrl('invalid-provider')).rejects.toThrow(BadRequestException);
    });
  });

  describe('handleOAuthCallback', () => {
    it('should handle OAuth callback successfully', async () => {
      const mockSupabaseClient = require('@supabase/supabase-js').createClient();
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        role: UserRole.PATIENT,
        status: UserStatus.ACTIVE,
      };
      mockSupabaseClient.auth.exchangeCodeForSession.mockResolvedValue({
        data: {
          session: { access_token: 'access-token', refresh_token: 'refresh-token' },
          user: {
            id: 'supabase-123',
            email: 'test@example.com',
            user_metadata: { full_name: 'John Doe' },
          },
        },
        error: null,
      });
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue(mockUser);
      mockJwtService.sign
        .mockReturnValueOnce('access-token')
        .mockReturnValueOnce('refresh-token');

      const result = await service.handleOAuthCallback('google', 'auth-code');

      expect(mockSupabaseClient.auth.exchangeCodeForSession).toHaveBeenCalledWith('auth-code');
      expect(mockPrismaService.user.create).toHaveBeenCalled();
      expect(mockJwtService.sign).toHaveBeenCalledTimes(2);
      expect(result).toEqual({
        access_token: 'access-token',
        refresh_token: 'refresh-token',
        token_type: 'Bearer',
        expires_in: 900,
      });
    });

    it('should throw UnauthorizedException if OAuth fails', async () => {
      const mockSupabaseClient = require('@supabase/supabase-js').createClient();
      mockSupabaseClient.auth.exchangeCodeForSession.mockResolvedValue({
        data: null,
        error: { message: 'Invalid code' },
      });

      await expect(service.handleOAuthCallback('google', 'auth-code')).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('validateToken', () => {
    it('should validate a valid token', async () => {
      const mockPayload: TokenPayload = {
        sub: 'user-123',
        email: 'test@example.com',
        role: 'PATIENT',
      };
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        status: UserStatus.ACTIVE,
      };

      mockJwtService.verify.mockReturnValue(mockPayload);
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.validateToken('valid-token');

      expect(mockJwtService.verify).toHaveBeenCalledWith('valid-token', {
        secret: 'jwt-secret',
      });
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-123' },
      });
      expect(result).toEqual(mockPayload);
    });

    it('should throw UnauthorizedException for invalid token', async () => {
      mockJwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(service.validateToken('invalid-token')).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for inactive user', async () => {
      const mockPayload: TokenPayload = {
        sub: 'user-123',
        email: 'test@example.com',
        role: 'PATIENT',
      };
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        status: UserStatus.INACTIVE,
      };

      mockJwtService.verify.mockReturnValue(mockPayload);
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      await expect(service.validateToken('valid-token')).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('refreshToken', () => {
    it('should refresh token successfully with JWT', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        role: UserRole.PATIENT,
        status: UserStatus.ACTIVE,
      };
      const mockPayload: TokenPayload = {
        sub: 'user-123',
        email: 'test@example.com',
        role: 'PATIENT',
      };

      mockJwtService.verify.mockReturnValue(mockPayload);
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockJwtService.sign
        .mockReturnValueOnce('new-access-token')
        .mockReturnValueOnce('new-refresh-token');

      const result = await service.refreshToken('refresh-token');

      expect(mockJwtService.verify).toHaveBeenCalledWith('refresh-token', {
        secret: 'refresh-secret',
      });
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-123' },
      });
      expect(mockJwtService.sign).toHaveBeenCalledTimes(2);
      expect(result).toEqual({
        access_token: 'new-access-token',
        refresh_token: 'new-refresh-token',
        token_type: 'Bearer',
        expires_in: 900,
      });
    });

    it('should refresh token successfully with Supabase', async () => {
      const mockSupabaseClient = require('@supabase/supabase-js').createClient();
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        role: UserRole.PATIENT,
        status: UserStatus.ACTIVE,
        supabaseUserId: 'supabase-123',
      };
      mockJwtService.verify.mockImplementation(() => {
        throw new Error('Invalid JWT');
      });
      mockSupabaseClient.auth.refreshSession.mockResolvedValue({
        data: {
          session: { access_token: 'new-access-token', refresh_token: 'new-refresh-token' },
          user: { id: 'supabase-123', email: 'test@example.com' },
        },
        error: null,
      });
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockJwtService.sign
        .mockReturnValueOnce('new-access-token')
        .mockReturnValueOnce('new-refresh-token');

      const result = await service.refreshToken('refresh-token');

      expect(mockSupabaseClient.auth.refreshSession).toHaveBeenCalledWith({
        refresh_token: 'refresh-token',
      });
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { supabaseUserId: 'supabase-123' },
      });
      expect(mockJwtService.sign).toHaveBeenCalledTimes(2);
      expect(result).toEqual({
        access_token: 'new-access-token',
        refresh_token: 'new-refresh-token',
        token_type: 'Bearer',
        expires_in: 900,
      });
    });

    it('should throw UnauthorizedException for invalid refresh token', async () => {
      mockJwtService.verify.mockImplementation(() => {
        throw new Error('Invalid JWT');
      });
      const mockSupabaseClient = require('@supabase/supabase-js').createClient();
      mockSupabaseClient.auth.refreshSession.mockResolvedValue({
        data: null,
        error: { message: 'Invalid refresh token' },
      });

      await expect(service.refreshToken('invalid-token')).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('loginWithSupabaseToken', () => {
    it('should login with Supabase token successfully', async () => {
      const mockSupabaseClient = require('@supabase/supabase-js').createClient();
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        role: UserRole.PATIENT,
        status: UserStatus.ACTIVE,
      };
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: {
          user: {
            id: 'supabase-123',
            email: 'test@example.com',
            user_metadata: { full_name: 'John Doe' },
          },
        },
        error: null,
      });
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue(mockUser);
      mockJwtService.sign
        .mockReturnValueOnce('access-token')
        .mockReturnValueOnce('refresh-token');

      const result = await service.loginWithSupabaseToken('supabase-token');

      expect(mockSupabaseClient.auth.getUser).toHaveBeenCalledWith('supabase-token');
      expect(mockPrismaService.user.create).toHaveBeenCalled();
      expect(mockJwtService.sign).toHaveBeenCalledTimes(2);
      expect(result).toEqual({
        access_token: 'access-token',
        refresh_token: 'refresh-token',
        token_type: 'Bearer',
        expires_in: 900,
      });
    });

    it('should throw UnauthorizedException for invalid Supabase token', async () => {
      const mockSupabaseClient = require('@supabase/supabase-js').createClient();
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: null,
        error: { message: 'Invalid token' },
      });

      await expect(service.loginWithSupabaseToken('invalid-token')).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('getUserFromAccessToken', () => {
    it('should get user from access token successfully', async () => {
      const mockSupabaseClient = require('@supabase/supabase-js').createClient();
      const mockUser = {
        id: 'supabase-123',
        email: 'test@example.com',
      };
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const result = await service.getUserFromAccessToken('access-token');

      expect(mockSupabaseClient.auth.getUser).toHaveBeenCalledWith('access-token');
      expect(result).toEqual(mockUser);
    });

    it('should throw UnauthorizedException if token is invalid', async () => {
      const mockSupabaseClient = require('@supabase/supabase-js').createClient();
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: null,
        error: { message: 'Invalid token' },
      });

      await expect(service.getUserFromAccessToken('invalid-token')).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('signJwt', () => {
    it('should sign JWT token successfully', async () => {
      const payload: TokenPayload = {
        sub: 'user-123',
        email: 'test@example.com',
        role: 'PATIENT',
      };
      mockJwtService.sign.mockReturnValue('signed-token');

      const result = service.signJwt(payload);

      expect(mockJwtService.sign).toHaveBeenCalledWith(payload, {
        secret: 'jwt-secret',
        expiresIn: '15m',
      });
      expect(result).toBe('signed-token');
    });
  });

  describe('findOrCreateUser', () => {
    it('should find existing user', async () => {
      const supabaseUser: SupabaseUser = {
        id: 'supabase-123',
        email: 'test@example.com',
        user_metadata: { full_name: 'John Doe' },
        app_metadata: {},
        aud: 'authenticated',
      };
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        role: UserRole.PATIENT,
        status: UserStatus.ACTIVE,
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findOrCreateUser(supabaseUser, 'google');

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { supabaseUserId: 'supabase-123' },
      });
      expect(mockPrismaService.user.create).not.toHaveBeenCalled();
      expect(result).toEqual(mockUser);
    });

    it('should create new user if not found', async () => {
      const supabaseUser: SupabaseUser = {
        id: 'supabase-123',
        email: 'test@example.com',
        user_metadata: { full_name: 'John Doe' },
        app_metadata: {},
        aud: 'authenticated',
      };
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        role: UserRole.PATIENT,
        status: UserStatus.ACTIVE,
      };

      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue(mockUser);

      const result = await service.findOrCreateUser(supabaseUser, 'google');

      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: {
          email: 'test@example.com',
          firstName: 'John',
          lastName: 'Doe',
          role: UserRole.PATIENT,
          profileImageUrl: null,
          supabaseUserId: 'supabase-123',
          status: UserStatus.ACTIVE,
        },
      });
      expect(result).toEqual(mockUser);
    });

    it('should throw BadRequestException for invalid Supabase user data', async () => {
      const supabaseUser: SupabaseUser = {
        id: '',
        email: '',
        user_metadata: { full_name: 'John Doe' },
        app_metadata: {},
        aud: 'authenticated',
      };

      await expect(service.findOrCreateUser(supabaseUser, 'google')).rejects.toThrow(BadRequestException);
    });
  });
});