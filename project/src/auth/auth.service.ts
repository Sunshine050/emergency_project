import {
  Injectable,
  UnauthorizedException,
  InternalServerErrorException,
  Logger,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { PrismaService } from '../prisma/prisma.service';
import { SupabaseUser, TokenPayload, AuthTokens } from '../common/interfaces/auth.interface';
import { UserRole, UserStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { Socket } from 'socket.io'; // เพิ่ม import Socket
import { config } from 'dotenv';
config();

@Injectable()
export class AuthService {
  private supabase: SupabaseClient;
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {
    this.supabase = createClient(
      this.configService.get<string>('SUPABASE_URL'),
      this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY'),
    );
  }

  /**
   * ลงทะเบียนผู้ใช้ใหม่ด้วยอีเมลและรหัสผ่าน (สำหรับเจ้าหน้าที่)
   */
  async register(registerDto: RegisterDto) {
    this.logger.log(`ลงทะเบียนผู้ใช้ใหม่: ${registerDto.email}`);

    const { email, password, firstName, lastName, phone, role } = registerDto;

    const allowedRoles: UserRole[] = [
      UserRole.EMERGENCY_CENTER,
      UserRole.HOSPITAL,
      UserRole.RESCUE_TEAM,
      UserRole.ADMIN,
    ];
    if (role && !allowedRoles.includes(role)) {
      this.logger.warn(`บทบาทไม่ได้รับอนุญาต: ${role}`);
      throw new BadRequestException('บทบาทนี้ไม่สามารถลงทะเบียนด้วยวิธีนี้ได้');
    }

    try {
      const existingUser = await this.prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        this.logger.warn(`อีเมล ${email} มีอยู่แล้ว`);
        throw new ConflictException('อีเมลนี้ถูกใช้งานแล้ว');
      }

      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      const user = await this.prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          firstName,
          lastName,
          phone: phone || null,
          role: role || UserRole.ADMIN,
          status: UserStatus.ACTIVE,
        },
      });

      this.logger.log(`สร้างผู้ใช้ใหม่สำเร็จ: ${user.id}`);
      return user;
    } catch (error) {
      this.logger.error(`ข้อผิดพลาดในการลงทะเบียน: ${error.message}`, error.stack);
      throw error instanceof ConflictException
        ? error
        : new InternalServerErrorException('ไม่สามารถลงทะเบียนผู้ใช้ได้');
    }
  }

  /**
   * ล็อกอินด้วยอีเมลและรหัสผ่าน
   */
  async login(loginDto: LoginDto): Promise<AuthTokens> {
    this.logger.log(`ล็อกอินผู้ใช้: ${loginDto.email}`);

    const { email, password } = loginDto;

    try {
      const user = await this.prisma.user.findUnique({
        where: { email },
      });

      if (!user || !user.password) {
        this.logger.warn(`ไม่พบผู้ใช้หรือผู้ใช้ไม่มีรหัสผ่าน: ${email}`);
        throw new UnauthorizedException('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        this.logger.warn(`รหัสผ่านไม่ถูกต้องสำหรับ: ${email}`);
        throw new UnauthorizedException('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
      }

      if (user.status !== UserStatus.ACTIVE) {
        this.logger.warn(`ผู้ใช้ไม่ใช้งาน: ${email}`);
        throw new UnauthorizedException('บัญชีนี้ถูกปิดใช้งาน');
      }

      const payload: TokenPayload = {
        sub: user.id,
        email: user.email,
        role: user.role.toString(),
      };

      const accessToken = this.jwtService.sign(payload);

      const refreshToken = this.jwtService.sign(payload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '30d'),
      });

      this.logger.log(`ล็อกอินสำเร็จสำหรับผู้ใช้: ${user.id}`);
      return {
        access_token: accessToken,
        refresh_token: refreshToken,
        token_type: 'Bearer',
        expires_in: parseInt(this.configService.get('JWT_EXPIRES_IN', '604800')),
      };
    } catch (error) {
      this.logger.error(`ข้อผิดพลาดในการล็อกอิน: ${error.message}`, error.stack);
      throw error instanceof UnauthorizedException
        ? error
        : new InternalServerErrorException('ไม่สามารถล็อกอินได้');
    }
  }

  /**
   * Generates an authorization URL for the specified OAuth provider
   */
  async generateAuthUrl(provider: string): Promise<string> {
    const validProviders = ['google', 'facebook', 'apple'];

    this.logger.log(`สร้าง auth URL สำหรับ provider: ${provider}`);

    if (!validProviders.includes(provider)) {
      this.logger.error(`ไม่รองรับ provider: ${provider}`);
      throw new BadRequestException(`ไม่รองรับ provider: ${provider}`);
    }

    try {
      const redirectUrl = this.configService.get<string>('OAUTH_REDIRECT_URL');
      this.logger.log(`Redirect URL: ${redirectUrl}`);

      const { data, error } = await this.supabase.auth.signInWithOAuth({
        provider: provider as any,
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            response_type: 'code',
            access_type: 'offline',
          },
        },
      });

      if (error) {
        this.logger.error(`ไม่สามารถสร้าง auth URL: ${error.message}`);
        throw new InternalServerErrorException('ไม่สามารถสร้าง URL การยืนยันตัวตน');
      }

      this.logger.log(`สร้าง auth URL สำเร็จ: ${data.url}`);
      return data.url;
    } catch (error) {
      this.logger.error(`ข้อผิดพลาดในการสร้าง ${provider} auth URL: ${error.message}`, error.stack);
      throw new InternalServerErrorException('ไม่สามารถเริ่มต้น OAuth flow');
    }
  }

  /**
   * Handles the OAuth callback from providers
   */
  async handleOAuthCallback(provider: string, code: string): Promise<AuthTokens> {
    this.logger.log(`จัดการ OAuth callback สำหรับ provider: ${provider} ด้วย code: ${code}`);

    try {
      const { data, error } = await this.supabase.auth.exchangeCodeForSession(code);

      if (error || !data?.session) {
        this.logger.error(`OAuth code exchange ล้มเหลว: ${error?.message}`);
        throw new UnauthorizedException('ไม่สามารถยืนยันตัวตนกับ provider');
      }

      this.logger.log(`OAuth session data: ${JSON.stringify(data)}`);

      const supabaseUser = data.user as SupabaseUser;

      if (!supabaseUser || !supabaseUser.id) {
        this.logger.error('ได้รับข้อมูลผู้ใช้ไม่ถูกต้องจาก provider');
        throw new UnauthorizedException('ได้รับข้อมูลผู้ใช้ไม่ถูกต้องจาก provider');
      }

      const user = await this.findOrCreateUser(supabaseUser, provider);

      const payload: TokenPayload = {
        sub: user.id,
        email: user.email,
        role: user.role.toString(),
      };

      const accessToken = this.jwtService.sign(payload);

      this.logger.log(`สร้าง access token สำหรับผู้ใช้: ${user.id}`);

      return {
        access_token: accessToken,
        refresh_token: data.session.refresh_token,
        token_type: 'Bearer',
        expires_in: parseInt(this.configService.get('JWT_EXPIRES_IN', '604800')),
      };
    } catch (error) {
      this.logger.error(`ข้อผิดพลาดในการจัดการ OAuth callback: ${error.message}`, error.stack);
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new InternalServerErrorException('ไม่สามารถประมวลผลการยืนยันตัวตน');
    }
  }

  /**
   * Find existing user or create a new one based on OAuth user data
   */
  private async findOrCreateUser(supabaseUser: SupabaseUser, provider: string) {
    this.logger.log(`ค้นหาหรือสร้างผู้ใช้จาก provider: ${provider}`);

    try {
      let user = await this.prisma.user.findUnique({
        where: { supabaseUserId: supabaseUser.id },
      });

      if (!user) {
        this.logger.log('ไม่พบผู้ใช้, สร้างผู้ใช้ใหม่');

        const { user_metadata } = supabaseUser;

        let firstName = '';
        let lastName = '';

        if (user_metadata.full_name) {
          const nameParts = user_metadata.full_name.split(' ');
          firstName = nameParts[0] || '';
          lastName = nameParts.slice(1).join(' ') || '';
        } else if (user_metadata.name) {
          const nameParts = user_metadata.name.split(' ');
          firstName = nameParts[0] || '';
          lastName = nameParts.slice(1).join(' ') || '';
        }

        user = await this.prisma.user.create({
          data: {
            email: supabaseUser.email,
            firstName,
            lastName,
            role: UserRole.PATIENT,
            profileImageUrl: user_metadata.avatar_url || user_metadata.picture,
            supabaseUserId: supabaseUser.id,
            status: UserStatus.ACTIVE,
          },
        });

        this.logger.log(`สร้างผู้ใช้ใหม่จาก ${provider} OAuth: ${user.id}`);
      }

      return user;
    } catch (error) {
      this.logger.error(`ข้อผิดพลาดในการค้นหา/สร้างผู้ใช้: ${error.message}`, error.stack);
      throw new InternalServerErrorException('ไม่สามารถประมวลผลข้อมูลผู้ใช้');
    }
  }

  /**
 * Verify JWT token with detailed debug
 */
async verifyToken(token: string) {
  try {
    // 1️⃣ เช็คว่ามี token หรือไม่
    if (!token) {
      this.logger.warn('No token provided');
      throw new UnauthorizedException('Token is required');
    }

    // 2️⃣ ดึง secret จาก config
    const secret = this.configService.get<string>('JWT_SECRET');
    if (!secret) {
      this.logger.error('JWT_SECRET not set in config');
      throw new UnauthorizedException('Server misconfiguration');
    }

    // 3️⃣ Verify token
    let payload: TokenPayload;
    try {
      payload = jwt.verify(token, secret) as TokenPayload;
      this.logger.debug(`Token verified successfully: ${JSON.stringify(payload)}`);
    } catch (err) {
      this.logger.warn(`Token verification failed: ${err.message}`);
      throw new UnauthorizedException('Invalid or expired token');
    }

    // 4️⃣ ตรวจสอบ user จาก payload
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user) {
      this.logger.warn(`User not found for token sub: ${payload.sub}`);
      throw new UnauthorizedException('Invalid token: user not found');
    }

    if (user.status !== UserStatus.ACTIVE) {
      this.logger.warn(`User not active: ${payload.sub}, status: ${user.status}`);
      throw new UnauthorizedException('User not active');
    }

    // 5️⃣ ถ้าผ่านทุกอย่าง ส่ง payload กลับ
    return payload;
  } catch (error) {
    this.logger.error(`verifyToken error: ${error.message}`);
    throw new UnauthorizedException(error.message);
  }
}


  /**
   * Handle WebSocket connection
   */
  async handleConnection(socket: Socket) {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        throw new UnauthorizedException('No token provided');
      }

      const payload = await this.verifyToken(token);
      socket.data.user = payload;
      this.logger.log(`Client connected: ${socket.id}, User: ${payload.sub}`);
    } catch (error) {
      this.logger.error(`Connection error: ${error.message}`);
      socket.emit('error', { message: 'Authentication failed' });
      socket.disconnect();
    }
  }

  /**
   * Refreshes an access token using a refresh token
   */
  async refreshToken(refreshToken: string): Promise<{ access_token: string }> {
    this.logger.log(`รีเฟรช token ด้วย refresh token`);

    try {
      try {
        const payload = this.jwtService.verify<TokenPayload>(refreshToken, {
          secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        });

        const user = await this.prisma.user.findUnique({
          where: { id: payload.sub },
        });

        if (!user || user.status !== UserStatus.ACTIVE) {
          this.logger.error('ไม่พบผู้ใช้หรือผู้ใช้ไม่ใช้งาน');
          throw new UnauthorizedException('ไม่พบผู้ใช้หรือผู้ใช้ไม่ใช้งาน');
        }

        const newPayload: TokenPayload = {
          sub: user.id,
          email: user.email,
          role: user.role.toString(),
        };

        this.logger.log(`สร้าง access token ใหม่สำหรับผู้ใช้: ${user.id}`);
        return {
          access_token: this.jwtService.sign(newPayload),
        };
      } catch (jwtError) {
        const { data, error } = await this.supabase.auth.refreshSession({
          refresh_token: refreshToken,
        });

        if (error || !data?.session) {
          this.logger.error(`ไม่สามารถรีเฟรช session: ${error?.message}`);
          throw new UnauthorizedException('refresh token ไม่ถูกต้อง');
        }

        const user = await this.prisma.user.findUnique({
          where: { supabaseUserId: data.user.id },
        });

        if (!user || user.status !== UserStatus.ACTIVE) {
          this.logger.error('ไม่พบผู้ใช้หรือผู้ใช้ไม่ใช้งาน');
          throw new UnauthorizedException('ไม่พบผู้ใช้หรือผู้ใช้ไม่ใช้งาน');
        }

        const payload: TokenPayload = {
          sub: user.id,
          email: user.email,
          role: user.role.toString(),
        };

        this.logger.log(`สร้าง access token ใหม่สำหรับผู้ใช้: ${user.id}`);
        return {
          access_token: this.jwtService.sign(payload),
        };
      }
    } catch (error) {
      this.logger.error(`ข้อผิดพลาดในการรีเฟรช token: ${error.message}`, error.stack);
      throw new UnauthorizedException('ไม่สามารถรีเฟรช token');
    }
  }

  async loginWithSupabaseToken(access_token: string): Promise<AuthTokens> {
    this.logger.log(`กำลังตรวจสอบ access token จาก Supabase`);

    try {
      const { data, error } = await this.supabase.auth.getUser(access_token);

      if (error || !data?.user) {
        this.logger.error(`ไม่สามารถตรวจสอบ access token: ${error?.message}`);
        throw new UnauthorizedException('ไม่สามารถตรวจสอบ token');
      }

      const supabaseUser = data.user as SupabaseUser;

      const user = await this.findOrCreateUser(supabaseUser, 'supabase');

      const payload: TokenPayload = {
        sub: user.id,
        email: user.email,
        role: user.role.toString(),
      };

      const jwtAccessToken = this.jwtService.sign(payload);
      const jwtRefreshToken = this.jwtService.sign(payload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '30d'),
      });

      return {
        access_token: jwtAccessToken,
        refresh_token: jwtRefreshToken,
        token_type: 'Bearer',
        expires_in: parseInt(this.configService.get('JWT_EXPIRES_IN', '604800')),
      };
    } catch (error) {
      this.logger.error(`ข้อผิดพลาดในการเข้าสู่ระบบด้วย Supabase token: ${error.message}`, error.stack);
      throw new InternalServerErrorException('ไม่สามารถเข้าสู่ระบบด้วย Supabase token');
    }
  }
}