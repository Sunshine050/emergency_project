import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsIn,
  IsOptional,
  IsEnum,
} from "class-validator";
import { UserRole } from "@prisma/client";
import { ApiProperty } from "@nestjs/swagger"; // เพิ่ม import

/**
 * DTO for initiating an OAuth login flow
 */
export class OAuthLoginDto {
  @ApiProperty({ description: "OAuth provider", enum: ["google", "facebook", "apple"] })
  @IsNotEmpty()
  @IsString()
  @IsIn(["google", "facebook", "apple"])
  provider: string;

  @ApiProperty({ description: "Redirect URL after login (optional)", required: false })
  @IsOptional()
  @IsString()
  redirectUrl?: string;
}

/**
 * DTO for handling OAuth callback
 */
export class OAuthCallbackDto {
  @ApiProperty({ description: "Authorization code from OAuth provider" })
  @IsNotEmpty()
  @IsString()
  code: string;
}

/**
 * DTO for user registration (email/password)
 */
export class RegisterDto {
  @ApiProperty({ description: "User email", example: "user@example.com" })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ description: "User password", example: "password123" })
  @IsNotEmpty()
  @IsString()
  password: string;

  @ApiProperty({ description: "User first name", example: "John" })
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @ApiProperty({ description: "User last name", example: "Doe" })
  @IsNotEmpty()
  @IsString()
  lastName: string;

  @ApiProperty({ description: "User phone number (optional)", example: "1234567890", required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({
    description: "User role",
    enum: UserRole,
    example: UserRole.EMERGENCY_CENTER,
    required: false,
  })
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
  @ApiProperty({ description: "User email", example: "user@example.com" })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ description: "User password", example: "password123" })
  @IsNotEmpty()
  @IsString()
  password: string;
}

/**
 * DTO for refreshing tokens
 */
export class RefreshTokenDto {
  @ApiProperty({ description: "Refresh token" })
  @IsNotEmpty()
  @IsString()
  refreshToken: string;
}