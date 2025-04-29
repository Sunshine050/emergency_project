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
} from "@nestjs/common";
import { Response } from "express";
import { AuthService } from "./auth.service";
import { OAuthLoginDto, RegisterDto, LoginDto, RefreshTokenDto } from "./dto/auth.dto"; // เพิ่ม RefreshTokenDto
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { ConfigService } from "@nestjs/config";
import { Public } from "./decorators/public.decorator";
import { UserRole } from "@prisma/client";
import { TokenPayload } from "../common/interfaces/auth.interface";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiQuery,
} from "@nestjs/swagger";

@ApiTags("Auth")
@Controller("auth")
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
  @Post("register")
  @ApiOperation({ summary: "Register a new user (staff)" })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({ status: 201, description: "Registration successful" })
  @ApiResponse({ status: 400, description: "Registration failed" })
  async register(@Body() registerDto: RegisterDto, @Res() res: Response) {
    try {
      const user = await this.authService.register(registerDto);
      return res.status(HttpStatus.CREATED).json({
        message: "Registration successful",
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
      return res.status(HttpStatus.BAD_REQUEST).json({
        message: "Registration failed",
        error: error.message,
      });
    }
  }

  /**
   * Login with email and password
   */
  @Public()
  @Post("login")
  @ApiOperation({ summary: "Login with email and password" })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: "Login successful" })
  @ApiResponse({ status: 401, description: "Login failed" })
  async login(@Body() loginDto: LoginDto, @Res() res: Response) {
    try {
      const authResult = await this.authService.login(loginDto);
      return res.status(HttpStatus.OK).json({
        message: "Login successful",
        access_token: authResult.access_token,
        refresh_token: authResult.refresh_token,
        token_type: authResult.token_type,
        expires_in: authResult.expires_in,
      });
    } catch (error) {
      this.logger.error(`Error during login: ${error.message}`, error.stack);
      return res.status(HttpStatus.UNAUTHORIZED).json({
        message: "Login failed",
        error: error.message,
      });
    }
  }

  /**
   * Initiates OAuth login flow by redirecting to the appropriate provider
   */
  @Public()
  @Post("login/oauth")
  @ApiOperation({ summary: "Initiate OAuth login flow" })
  @ApiBody({ type: OAuthLoginDto })
  @ApiResponse({ status: 200, description: "OAuth URL generated" })
  @ApiResponse({ status: 401, description: "Cannot initiate OAuth login" })
  async oauthLogin(@Body() oauthLoginDto: OAuthLoginDto, @Res() res: Response) {
    try {
      const authUrl = await this.authService.generateAuthUrl(oauthLoginDto.provider);
      return res.status(HttpStatus.OK).json({ url: authUrl });
    } catch (error) {
      this.logger.error(`Error in OAuth login: ${error.message}`, error.stack);
      throw new UnauthorizedException("Cannot initiate OAuth login");
    }
  }

  /**
   * Handles OAuth callback from providers
   */
  @Public()
  @Get("callback")
  @ApiOperation({ summary: "Handle OAuth callback" })
  @ApiQuery({ name: "provider", required: true, description: "OAuth provider (google, facebook, apple)" })
  @ApiQuery({ name: "code", required: false, description: "Authorization code" })
  @ApiQuery({ name: "access_token", required: false, description: "Access token for implicit flow" })
  @ApiResponse({ status: 200, description: "OAuth callback successful" })
  @ApiResponse({ status: 400, description: "Missing provider or code/access_token" })
  @ApiResponse({ status: 401, description: "Cannot authenticate with provider" })
  async oauthCallback(
    @Query("provider") provider: string,
    @Query("code") code: string,
    @Query("access_token") accessToken: string,
    @Res() res: Response,
  ) {
    this.logger.debug(`Received callback -> provider: ${provider}, code: ${code}, access_token: ${accessToken}`);

    if (!provider) {
      this.logger.warn("Missing provider in callback");
      return res.status(HttpStatus.BAD_REQUEST).json({
        message: "Missing provider in callback",
      });
    }

    try {
      let authResult;
      if (code) {
        // Authorization Code Flow
        authResult = await this.authService.handleOAuthCallback(provider, code);
      } else if (accessToken) {
        // Implicit Flow: Use access_token directly
        const supabaseUser = await this.authService.getUserFromAccessToken(accessToken);
        const user = await this.authService.findOrCreateUser(supabaseUser, provider);
        const payload: TokenPayload = {
          sub: user.id,
          email: user.email,
          role: user.role.toString(),
        };
        const jwtAccessToken = this.authService.signJwt(payload);
        authResult = {
          access_token: jwtAccessToken,
          refresh_token: "",
          token_type: "Bearer",
          expires_in: parseInt(this.configService.get("JWT_EXPIRES_IN", "604800")),
        };
      } else {
        this.logger.warn("Missing code or access_token in callback");
        return res.status(HttpStatus.BAD_REQUEST).json({
          message: "Missing code or access_token in callback",
        });
      }

      return res.status(HttpStatus.OK).json({
        message: "OAuth callback successful",
        access_token: authResult.access_token,
        refresh_token: authResult.refresh_token,
        token_type: authResult.token_type,
        expires_in: authResult.expires_in,
      });
    } catch (error) {
      this.logger.error(`Error in OAuth callback: ${error.message}`, error.stack);
      return res.status(HttpStatus.UNAUTHORIZED).json({
        message: "Cannot authenticate with provider",
        error: error.message,
      });
    }
  }

  /**
   * Test endpoint to verify user authentication
   */
  @UseGuards(JwtAuthGuard)
  @Get("me")
  @ApiOperation({ summary: "Get authenticated user profile" })
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: "User profile retrieved" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  getProfile(@Req() req) {
    return req.user;
  }

  /**
   * Refreshes the JWT token using a refresh token
   */
  @Public()
  @Post("refresh")
  @ApiOperation({ summary: "Refresh JWT token" })
  @ApiBody({ type: RefreshTokenDto })
  @ApiResponse({ status: 200, description: "Token refreshed successfully" })
  async refreshToken(@Body("refreshToken") refreshToken: string) {
    return this.authService.refreshToken(refreshToken);
  }

  @Post("supabase-login")
  @ApiOperation({ summary: "Login with Supabase token" })
  @ApiBody({ schema: { type: "object", properties: { access_token: { type: "string" } } } })
  @ApiResponse({ status: 200, description: "Supabase login successful" })
  async supabaseLogin(@Body() body: { access_token: string }) {
    return this.authService.loginWithSupabaseToken(body.access_token);
  }
}