import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Req,
  Res,
  HttpStatus,
  UnauthorizedException,
  Logger,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { OAuthLoginDto, RegisterDto, LoginDto } from './dto/auth.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ConfigService } from '@nestjs/config';
import { Public } from './decorators/public.decorator';
import { UserRole } from '@prisma/client';
import { SupabaseService } from '../supabase/supabase.service';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * ลงทะเบียนผู้ใช้ใหม่ (เจ้าหน้าที่) ด้วยอีเมลและรหัสผ่าน
   */
  @Public()
  @Post('register')
  async register(@Body() registerDto: RegisterDto, @Res() res: Response) {
    try {
      const user = await this.authService.register(registerDto);
      return res.status(HttpStatus.CREATED).json({
        message: 'ลงทะเบียนสำเร็จ',
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          role: user.role,
          status: user.status,
          supabaseUserId: user.supabaseUserId,
        },
      });
    } catch (error) {
      this.logger.error(`ข้อผิดพลาดในการลงทะเบียน: ${error.message}`, error.stack);
      return res.status(HttpStatus.BAD_REQUEST).json({
        message: 'ลงทะเบียนล้มเหลว',
        error: error.message,
      });
    }
  }

  /**
   * ล็อกอินด้วยอีเมลและรหัสผ่าน
   */
  @Public()
  @Post('login')
  async login(@Body() loginDto: LoginDto, @Res() res: Response) {
    try {
      const authResult = await this.authService.login(loginDto);
      return res.status(HttpStatus.OK).json({
        message: 'ล็อกอินสำเร็จ',
        access_token: authResult.access_token,
        refresh_token: authResult.refresh_token,
        token_type: authResult.token_type,
        expires_in: authResult.expires_in,
      });
    } catch (error) {
      this.logger.error(`ข้อผิดพลาดในการล็อกอิน: ${error.message}`, error.stack);
      return res.status(HttpStatus.UNAUTHORIZED).json({
        message: 'ล็อกอินล้มเหลว',
        error: error.message,
      });
    }
  }

  /**
   * Initiates OAuth login flow by redirecting to the appropriate provider
   */
  @Public()
  @Post('login/oauth')
  async oauthLogin(@Body() oauthLoginDto: OAuthLoginDto, @Res() res: Response) {
    try {
      const authUrl = await this.authService.generateAuthUrl(oauthLoginDto.provider);
      return res.status(HttpStatus.OK).json({ url: authUrl });
    } catch (error) {
      this.logger.error(`ข้อผิดพลาด OAuth login: ${error.message}`, error.stack);
      throw new UnauthorizedException('ไม่สามารถเริ่มต้น OAuth login');
    }
  }

  /**
   * Handles OAuth callback from providers
   */
  @Public()
  @Get('callback')
  async oauthCallback(
    @Query('provider') provider: string,
    @Query('code') code: string,
    @Res() res: Response,
  ) {
    this.logger.debug(`Received callback -> provider: ${provider}, code: ${code}`);

    if (!provider || !code) {
      this.logger.warn('Missing provider or code in callback');
      return res.status(HttpStatus.BAD_REQUEST).json({
        message: 'Missing provider or code in callback',
      });
    }

    try {
      const authResult = await this.authService.handleOAuthCallback(provider, code);
      return res.status(HttpStatus.OK).json({
        message: 'OAuth callback สำเร็จ',
        access_token: authResult.access_token,
        refresh_token: authResult.refresh_token,
        token_type: authResult.token_type,
        expires_in: authResult.expires_in,
      });
    } catch (error) {
      this.logger.error(`ข้อผิดพลาด OAuth callback: ${error.message}`, error.stack);
      return res.status(HttpStatus.UNAUTHORIZED).json({
        message: 'ไม่สามารถยืนยันตัวตนกับ provider',
        error: error.message,
      });
    }
  }

  /**
   * Test endpoint to verify user authentication
   */
  @UseGuards(JwtAuthGuard)
  @Get('me')
  getProfile(@Req() req) {
    return req.user;
  }

  /**
   * Refreshes the JWT token using a refresh token
   */
  @Public()
  @Post('refresh')
  async refreshToken(@Body('refreshToken') refreshToken: string) {
    return this.authService.refreshToken(refreshToken);
  }

  @Post('supabase-login')
async supabaseLogin(@Body() body: { access_token: string }) {
  return this.authService.loginWithSupabaseToken(body.access_token);
}

}