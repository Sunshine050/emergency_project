import {
  Injectable,
  UnauthorizedException,
  InternalServerErrorException,
  Logger,
  BadRequestException,
  ConflictException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { PrismaService } from "../prisma/prisma.service";
import {
  SupabaseUser,
  TokenPayload,
  AuthTokens,
} from "../common/interfaces/auth.interface";
import { UserRole, UserStatus } from "@prisma/client";
import * as bcrypt from "bcrypt";
import { RegisterDto, LoginDto } from "./dto/auth.dto";
import { config } from "dotenv";
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
      this.configService.get<string>("SUPABASE_URL"),
      this.configService.get<string>("SUPABASE_SERVICE_ROLE_KEY"),
    );
  }

  /**
   * Register a new user with email and password (for staff)
   */
  async register(registerDto: RegisterDto) {
    this.logger.log(`Registering new user: ${registerDto.email}`);

    const { email, password, firstName, lastName, phone, role } = registerDto;

    // Validate role (PATIENT not allowed for regular registration)
    const allowedRoles: UserRole[] = [
      UserRole.EMERGENCY_CENTER,
      UserRole.HOSPITAL,
      UserRole.RESCUE_TEAM,
      UserRole.ADMIN,
    ];
    if (role && !allowedRoles.includes(role)) {
      this.logger.warn(`Role not allowed: ${role}`);
      throw new BadRequestException("This role cannot be registered this way");
    }

    try {
      // Check if email already exists
      const existingUser = await this.prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        this.logger.warn(`Email already exists: ${email}`);
        throw new ConflictException("This email is already in use");
      }

      // Hash password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Create new user
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

      this.logger.log(`Successfully created new user: ${user.id}`);
      return user;
    } catch (error) {
      this.logger.error(`Error during registration: ${error.message}`, error.stack);
      throw error instanceof ConflictException
        ? error
        : new InternalServerErrorException("Cannot register user");
    }
  }

  /**
   * Login with email and password
   */
  async login(loginDto: LoginDto): Promise<AuthTokens> {
    this.logger.log(`Logging in user: ${loginDto.email}`);

    const { email, password } = loginDto;

    try {
      // Find user and select password
      const user = await this.prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          email: true,
          password: true,
          role: true,
          status: true,
        },
      });

      if (!user || !user.password) {
        this.logger.warn(`User not found or no password set: ${email}`);
        throw new UnauthorizedException("Invalid email or password");
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        this.logger.warn(`Invalid password for: ${email}`);
        throw new UnauthorizedException("Invalid email or password");
      }

      if (user.status !== UserStatus.ACTIVE) {
        this.logger.warn(`User is not active: ${email}`);
        throw new UnauthorizedException("This account is disabled");
      }

      // Generate JWT token
      const payload: TokenPayload = {
        sub: user.id,
        email: user.email,
        role: user.role.toString(),
      };

      const accessToken = this.jwtService.sign(payload);

      // Generate refresh token using JWT
      const refreshToken = this.jwtService.sign(payload, {
        secret: this.configService.get<string>("JWT_REFRESH_SECRET"),
        expiresIn: this.configService.get<string>("JWT_REFRESH_EXPIRES_IN", "30d"),
      });

      this.logger.log(`Login successful for user: ${user.id}`);
      return {
        access_token: accessToken,
        refresh_token: refreshToken,
        token_type: "Bearer",
        expires_in: parseInt(this.configService.get("JWT_EXPIRES_IN", "604800")),
      };
    } catch (error) {
      this.logger.error(`Error during login: ${error.message}`, error.stack);
      throw error instanceof UnauthorizedException
        ? error
        : new InternalServerErrorException("Cannot login");
    }
  }

  /**
   * Generates an authorization URL for the specified OAuth provider
   */
  async generateAuthUrl(provider: string): Promise<string> {
    const validProviders = ["google", "facebook", "apple"];

    this.logger.log(`Generating auth URL for provider: ${provider}`);

    if (!validProviders.includes(provider)) {
      this.logger.error(`Unsupported provider: ${provider}`);
      throw new BadRequestException(`Unsupported provider: ${provider}`);
    }

    try {
      const redirectUrl = this.configService.get<string>("OAUTH_REDIRECT_URL");
      this.logger.log(`Redirect URL: ${redirectUrl}`);

      const { data, error } = await this.supabase.auth.signInWithOAuth({
        provider: provider as any,
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            response_type: "code",
            access_type: "offline",
          },
        },
      });

      if (error) {
        this.logger.error(`Cannot generate auth URL: ${error.message}`);
        throw new InternalServerErrorException("Cannot generate authentication URL");
      }

      this.logger.log(`Successfully generated auth URL: ${data.url}`);
      return data.url;
    } catch (error) {
      this.logger.error(
        `Error generating ${provider} auth URL: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException("Cannot initiate OAuth flow");
    }
  }

  /**
   * Handles the OAuth callback from providers
   */
  async handleOAuthCallback(provider: string, code: string): Promise<AuthTokens> {
    this.logger.log(`Handling OAuth callback for provider: ${provider} with code: ${code}`);

    try {
      const { data, error } = await this.supabase.auth.exchangeCodeForSession(code);

      if (error || !data?.session) {
        this.logger.error(`OAuth code exchange failed: ${error?.message}`);
        throw new UnauthorizedException("Cannot authenticate with provider");
      }

      this.logger.log(`OAuth session data: ${JSON.stringify(data)}`);

      const supabaseUser = data.user as SupabaseUser;

      if (!supabaseUser || !supabaseUser.id) {
        this.logger.error("Invalid user data received from provider");
        throw new UnauthorizedException("Invalid user data received from provider");
      }

      const user = await this.findOrCreateUser(supabaseUser, provider);

      const payload: TokenPayload = {
        sub: user.id,
        email: user.email,
        role: user.role.toString(),
      };

      const accessToken = this.jwtService.sign(payload);

      this.logger.log(`Generated access token for user: ${user.id}`);

      return {
        access_token: accessToken,
        refresh_token: data.session.refresh_token,
        token_type: "Bearer",
        expires_in: parseInt(this.configService.get("JWT_EXPIRES_IN", "604800")),
      };
    } catch (error) {
      this.logger.error(`Error handling OAuth callback: ${error.message}`, error.stack);
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new InternalServerErrorException("Cannot process authentication");
    }
  }

  /**
   * Find existing user or create a new one based on OAuth user data
   */
  public async findOrCreateUser(supabaseUser: SupabaseUser, provider: string) {
    this.logger.log(`Finding or creating user from provider: ${provider}`);

    try {
      let user = await this.prisma.user.findUnique({
        where: { supabaseUserId: supabaseUser.id },
      });

      if (!user) {
        this.logger.log("User not found, creating new user");

        const { user_metadata } = supabaseUser;

        let firstName = "";
        let lastName = "";

        if (user_metadata.full_name) {
          const nameParts = user_metadata.full_name.split(" ");
          firstName = nameParts[0] || "";
          lastName = nameParts.slice(1).join(" ") || "";
        } else if (user_metadata.name) {
          const nameParts = user_metadata.name.split(" ");
          firstName = nameParts[0] || "";
          lastName = nameParts.slice(1).join(" ") || "";
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

        this.logger.log(`Created new user from ${provider} OAuth: ${user.id}`);
      }

      return user;
    } catch (error) {
      this.logger.error(`Error finding/creating user: ${error.message}`, error.stack);
      throw new InternalServerErrorException("Cannot process user data");
    }
  }

  /**
   * Validates a JWT token
   */
  async validateToken(token: string): Promise<TokenPayload> {
    this.logger.log(`Validating token: ${token}`);

    try {
      const payload = this.jwtService.verify<TokenPayload>(token);

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user || user.status !== UserStatus.ACTIVE) {
        this.logger.error("User not found or inactive");
        throw new UnauthorizedException("User not found or inactive");
      }

      this.logger.log(`Token validation successful for user: ${payload.sub}`);
      return payload;
    } catch (error) {
      this.logger.error(`Error validating token: ${error.message}`, error.stack);
      throw new UnauthorizedException("Invalid token");
    }
  }

  /**
   * Refreshes an access token using a refresh token
   */
  async refreshToken(refreshToken: string): Promise<{ access_token: string }> {
    this.logger.log(`Refreshing token with refresh token`);

    try {
      // Check if it's a refresh token from OAuth (Supabase) or regular login
      try {
        // Try to verify as JWT refresh token
        const payload = this.jwtService.verify<TokenPayload>(refreshToken, {
          secret: this.configService.get<string>("JWT_REFRESH_SECRET"),
        });

        // Find user
        const user = await this.prisma.user.findUnique({
          where: { id: payload.sub },
        });

        if (!user || user.status !== UserStatus.ACTIVE) {
          this.logger.error("User not found or inactive");
          throw new UnauthorizedException("User not found or inactive");
        }

        // Generate new access token
        const newPayload: TokenPayload = {
          sub: user.id,
          email: user.email,
          role: user.role.toString(),
        };

        this.logger.log(`Generated new access token for user: ${user.id}`);
        return {
          access_token: this.jwtService.sign(newPayload),
        };
      } catch (jwtError) {
        // If not a JWT refresh token, try Supabase (for OAuth)
        const { data, error } = await this.supabase.auth.refreshSession({
          refresh_token: refreshToken,
        });

        if (error || !data?.session) {
          this.logger.error(`Cannot refresh session: ${error?.message}`);
          throw new UnauthorizedException("Invalid refresh token");
        }

        const user = await this.prisma.user.findUnique({
          where: { supabaseUserId: data.user.id },
        });

        if (!user || user.status !== UserStatus.ACTIVE) {
          this.logger.error("User not found or inactive");
          throw new UnauthorizedException("User not found or inactive");
        }

        const payload: TokenPayload = {
          sub: user.id,
          email: user.email,
          role: user.role.toString(),
        };

        this.logger.log(`Generated new access token for user: ${user.id}`);
        return {
          access_token: this.jwtService.sign(payload),
        };
      }
    } catch (error) {
      this.logger.error(`Error refreshing token: ${error.message}`, error.stack);
      throw new UnauthorizedException("Cannot refresh token");
    }
  }

  async loginWithSupabaseToken(access_token: string): Promise<AuthTokens> {
    this.logger.log(`Validating access token from Supabase`);

    try {
      const { data, error } = await this.supabase.auth.getUser(access_token);

      if (error || !data?.user) {
        this.logger.error(`Cannot validate access token: ${error?.message}`);
        throw new UnauthorizedException("Cannot validate token");
      }

      const supabaseUser = data.user as SupabaseUser;

      const user = await this.findOrCreateUser(supabaseUser, "supabase");

      const payload: TokenPayload = {
        sub: user.id,
        email: user.email,
        role: user.role.toString(),
      };

      const jwtAccessToken = this.jwtService.sign(payload);
      const jwtRefreshToken = this.jwtService.sign(payload, {
        secret: this.configService.get<string>("JWT_REFRESH_SECRET"),
        expiresIn: this.configService.get<string>("JWT_REFRESH_EXPIRES_IN", "30d"),
      });

      return {
        access_token: jwtAccessToken,
        refresh_token: jwtRefreshToken,
        token_type: "Bearer",
        expires_in: parseInt(this.configService.get("JWT_EXPIRES_IN", "604800")),
      };
    } catch (error) {
      this.logger.error(`Error logging in with Supabase token: ${error.message}`, error.stack);
      throw new InternalServerErrorException("Cannot login with Supabase token");
    }
  }

  public async getUserFromAccessToken(accessToken: string): Promise<SupabaseUser> {
    const { data, error } = await this.supabase.auth.getUser(accessToken);
    if (error || !data?.user) {
      throw new UnauthorizedException('Cannot authenticate with provider');
    }
    return data.user as SupabaseUser;
  }

  public signJwt(payload: TokenPayload): string {
    return this.jwtService.sign(payload);
  }
}