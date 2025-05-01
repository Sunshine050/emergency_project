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
  BadRequestException,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { OAuthLoginDto, RegisterDto, LoginDto, RefreshTokenDto } from './dto/auth.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ConfigService } from '@nestjs/config';
import { Public } from './decorators/public.decorator';
import { TokenPayload } from '../common/interfaces/auth.interface';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';

// ฟังก์ชันช่วยกรองข้อมูลที่อ่อนไหวก่อนล็อก
const sanitizeLogData = (data: any) => {
  const { access_token, refresh_token, password, ...safeData } = data;
  return safeData;
};

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Register a new user (staff) with email and password
   */
  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Register a new user (staff)' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({ status: 201, description: 'Registration successful' })
  @ApiResponse({ status: 400, description: 'Registration failed' })
  @ApiResponse({ status: 409, description: 'Email already in use' })
  async register(@Body() registerDto: RegisterDto, @Res() res: Response) {
    this.logger.log(`Register endpoint hit with data: ${JSON.stringify(sanitizeLogData(registerDto))}`);
    try {
      const user = await this.authService.register(registerDto);
      this.logger.log(`Registration successful for user: ${user.id}, email: ${user.email}, role: ${user.role}`);
      return res.status(HttpStatus.CREATED).json({
        message: 'Registration successful',
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
      this.logger.error(`Error during registration: ${error.message}`, error.stack);
      const status = error.status === 409 ? HttpStatus.CONFLICT : HttpStatus.BAD_REQUEST;
      return res.status(status).json({
        message: 'Registration failed',
        error: error.message,
      });
    }
  }

  /**
   * Login with email and password
   */
  @Public()
  @Post('login')
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid email or password' })
  async login(@Body() loginDto: LoginDto, @Res() res: Response) {
    this.logger.log(`Login endpoint hit with email: ${loginDto.email}`);
    try {
      const authResult = await this.authService.login(loginDto);
      this.logger.log(`Login successful for email: ${loginDto.email}, token_type: ${authResult.token_type}, expires_in: ${authResult.expires_in}`);
      return res.status(HttpStatus.OK).json({
        message: 'Login successful',
        access_token: authResult.access_token,
        refresh_token: authResult.refresh_token,
        token_type: authResult.token_type,
        expires_in: authResult.expires_in,
      });
    } catch (error) {
      this.logger.error(`Error during login: ${error.message}`, error.stack);
      return res.status(HttpStatus.UNAUTHORIZED).json({
        message: 'Login failed',
        error: error.message,
      });
    }
  }

  /**
   * Initiates OAuth login flow by generating an authorization URL
   */
  @Public()
@Post('login/oauth')
@ApiOperation({ summary: 'Initiate OAuth login flow' })
@ApiBody({ type: OAuthLoginDto })
@ApiResponse({ status: 200, description: 'OAuth URL generated' })
@ApiResponse({ status: 400, description: 'Invalid provider' })
async oauthLogin(@Body() oauthLoginDto: OAuthLoginDto, @Res() res: Response) {
  this.logger.log(`OAuth login endpoint hit with provider: ${oauthLoginDto.provider}`);
  try {
    if (!oauthLoginDto.provider) {
      this.logger.warn('Missing provider in OAuth login request');
      return res.status(HttpStatus.BAD_REQUEST).json({
        message: 'Provider is required',
      });
    }
    const authUrl: string = await this.authService.generateAuthUrl(oauthLoginDto.provider);
    this.logger.log(`OAuth URL generated for provider: ${oauthLoginDto.provider}, url: ${authUrl}`);
    return res.status(HttpStatus.OK).json({ url: authUrl });
  } catch (error) {
    this.logger.error(`Error in OAuth login: ${error.message}`, error.stack);
    return res.status(HttpStatus.BAD_REQUEST).json({
      message: 'Cannot initiate OAuth login',
      error: error.message,
    });
  }
}

  /**
   * Handles OAuth callback from providers
   */
  @Public()
  @Get('callback')
  @ApiOperation({ summary: 'Handle OAuth callback' })
  @ApiQuery({ name: 'provider', required: true, description: 'OAuth provider (google, facebook, apple)' })
  @ApiQuery({ name: 'code', required: false, description: 'Authorization code' })
  @ApiQuery({ name: 'access_token', required: false, description: 'Access token for implicit flow' })
  @ApiResponse({ status: 200, description: 'OAuth callback successful' })
  @ApiResponse({ status: 400, description: 'Missing provider or code/access_token' })
  @ApiResponse({ status: 401, description: 'Cannot authenticate with provider' })
  async oauthCallback(
    @Query('provider') provider: string,
    @Query('code') code: string,
    @Query('access_token') accessToken: string,
    @Res() res: Response,
  ) {
    this.logger.log(`OAuth callback endpoint hit with provider: ${provider}, code: ${code ? 'present' : 'not present'}, access_token: ${accessToken ? 'present' : 'not present'}`);

    if (!provider) {
      this.logger.warn('Missing provider in callback');
      return res.status(HttpStatus.BAD_REQUEST).json({
        message: 'Missing provider in callback',
      });
    }

    try {
      let authResult;
      if (code) {
        // Authorization Code Flow
        authResult = await this.authService.handleOAuthCallback(provider, code);
        this.logger.log(`OAuth callback successful (code flow) for provider: ${provider}, token_type: ${authResult.token_type}, expires_in: ${authResult.expires_in}`);
      } else if (accessToken) {
        // Implicit Flow: Use access_token directly
        authResult = await this.authService.loginWithSupabaseToken(accessToken);
        this.logger.log(`OAuth callback successful (implicit flow) for provider: ${provider}, token_type: ${authResult.token_type}, expires_in: ${authResult.expires_in}`);
      } else {
        this.logger.warn('Missing code or access_token in callback');
        return res.status(HttpStatus.BAD_REQUEST).json({
          message: 'Missing code or access_token in callback',
        });
      }

      return res.status(HttpStatus.OK).json({
        message: 'OAuth callback successful',
        access_token: authResult.access_token,
        refresh_token: authResult.refresh_token,
        token_type: authResult.token_type,
        expires_in: authResult.expires_in,
      });
    } catch (error) {
      this.logger.error(`Error in OAuth callback: ${error.message}`, error.stack);
      return res.status(HttpStatus.UNAUTHORIZED).json({
        message: 'Cannot authenticate with provider',
        error: error.message,
      });
    }
  }

  /**
   * Test endpoint to verify user authentication
   */
  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiOperation({ summary: 'Get authenticated user profile' })
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'User profile retrieved' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getProfile(@Req() req) {
    this.logger.log(`Get profile endpoint hit for user: ${req.user.email}, role: ${req.user.role}`);
    return {
      message: 'User profile retrieved',
      user: req.user,
    };
  }

  /**
   * Verify JWT token
   */
  @UseGuards(JwtAuthGuard)
  @Get('verify-token')
  @ApiOperation({ summary: 'Verify JWT token' })
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Token is valid' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async verifyToken(@Req() req) {
    this.logger.log(`Verify token endpoint hit for user: ${req.user.email}`);
    return {
      message: 'Token is valid',
      user: req.user,
    };
  }

  /**
   * Refreshes the JWT token using a refresh token
   */
  @Public()
  @Post('refresh')
  @ApiOperation({ summary: 'Refresh JWT token' })
  @ApiBody({ type: RefreshTokenDto })
  @ApiResponse({ status: 200, description: 'Token refreshed successfully' })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  async refreshToken(@Body() body: RefreshTokenDto, @Res() res: Response) {
    this.logger.log('Refresh token endpoint hit');
    try {
      if (!body.refreshToken) {
        this.logger.warn('Missing refresh token in request');
        throw new BadRequestException('Refresh token is required');
      }
      const result = await this.authService.refreshToken(body.refreshToken);
      this.logger.log(`Token refresh successful for user: ${result.access_token ? 'success' : 'unknown'}, token_type: ${result.token_type}, expires_in: ${result.expires_in}`);
      return res.status(HttpStatus.OK).json({
        message: 'Token refreshed successfully',
        access_token: result.access_token,
        refresh_token: result.refresh_token,
        token_type: result.token_type,
        expires_in: result.expires_in,
      });
    } catch (error) {
      this.logger.error(`Error during token refresh: ${error.message}`, error.stack);
      return res.status(HttpStatus.UNAUTHORIZED).json({
        message: 'Cannot refresh token',
        error: error.message,
      });
    }
  }

  /**
   * Login with Supabase access token
   */
  @Public()
  @Post('supabase-login')
  @ApiOperation({ summary: 'Login with Supabase token' })
  @ApiBody({ schema: { type: 'object', properties: { access_token: { type: 'string' } } } })
  @ApiResponse({ status: 200, description: 'Supabase login successful' })
  @ApiResponse({ status: 401, description: 'Invalid Supabase token' })
  async supabaseLogin(@Body() body: { access_token: string }, @Res() res: Response) {
    this.logger.log('Supabase login endpoint hit');
    try {
      if (!body.access_token) {
        this.logger.warn('Missing access token in Supabase login request');
        throw new BadRequestException('Access token is required');
      }
      const result = await this.authService.loginWithSupabaseToken(body.access_token);
      this.logger.log(`Supabase login successful, token_type: ${result.token_type}, expires_in: ${result.expires_in}`);
      return res.status(HttpStatus.OK).json({
        message: 'Supabase login successful',
        access_token: result.access_token,
        refresh_token: result.refresh_token,
        token_type: result.token_type,
        expires_in: result.expires_in,
      });
    } catch (error) {
      this.logger.error(`Error during Supabase login: ${error.message}`, error.stack);
      return res.status(HttpStatus.UNAUTHORIZED).json({
        message: 'Cannot login with Supabase token',
        error: error.message,
      });
    }
  }
}