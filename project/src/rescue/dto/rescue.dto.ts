import { IsString, IsOptional, IsNumber, IsEmail, IsEnum, IsArray, IsUUID } from 'class-validator';

export enum RescueTeamStatus {
  AVAILABLE = 'AVAILABLE',
  BUSY = 'BUSY',
  OFF_DUTY = 'OFF_DUTY',
  MAINTENANCE = 'MAINTENANCE',
}

export class CreateRescueTeamDto {
  @IsString()
  name: string;

  @IsString()
  address: string;

  @IsString()
  city: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsString()
  postalCode: string;

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;

  @IsString()
  contactPhone: string;

  @IsOptional()
  @IsEmail()
  contactEmail?: string;

  @IsOptional()
  @IsArray()
  vehicleTypes?: string[];
}

export class UpdateRescueTeamDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  postalCode?: string;

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;

  @IsOptional()
  @IsString()
  contactPhone?: string;

  @IsOptional()
  @IsEmail()
  contactEmail?: string;

  @IsOptional()
  @IsArray()
  vehicleTypes?: string[];
}

export class UpdateRescueTeamStatusDto {
  @IsEnum(RescueTeamStatus)
  status: RescueTeamStatus;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsUUID()
  currentEmergencyId?: string;
}