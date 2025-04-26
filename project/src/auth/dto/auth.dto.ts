import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsIn,
  IsOptional,
  IsEnum,
} from "class-validator";
import { UserRole } from "@prisma/client";

/**
 * DTO for initiating an OAuth login flow
 */
export class OAuthLoginDto {
  @IsNotEmpty()
  @IsString()
  @IsIn(["google", "facebook", "apple"])
  provider: string;

  @IsOptional()
  @IsString()
  redirectUrl?: string;
}

/**
 * DTO for handling OAuth callback
 */
export class OAuthCallbackDto {
  @IsNotEmpty()
  @IsString()
  code: string;
}

/**
 * DTO for user registration (email/password)
 */
export class RegisterDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsNotEmpty()
  @IsString()
  firstName: string;

  @IsNotEmpty()
  @IsString()
  lastName: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsEnum(UserRole)
  @IsIn([
    UserRole.EMERGENCY_CENTER,
    UserRole.HOSPITAL,
    UserRole.RESCUE_TEAM,
    UserRole.ADMIN,
  ])
  role?: UserRole; // จำกัดบทบาทสำหรับเจ้าหน้าที่
}

/**
 * DTO for user login (email/password)
 */
export class LoginDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}

/**
 * DTO for refreshing tokens
 */
export class RefreshTokenDto {
  @IsNotEmpty()
  @IsString()
  refreshToken: string;
}
