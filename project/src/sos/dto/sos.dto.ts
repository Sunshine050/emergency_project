import { IsString, IsOptional, IsNumber, IsUUID, IsEnum, IsObject, IsBoolean } from 'class-validator';

enum EmergencyRequestStatus {
  PENDING = 'PENDING',
  ASSIGNED = 'ASSIGNED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export class CreateEmergencyRequestDto {
  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;

  @IsOptional()
  @IsObject()
  medicalInfo?: Record<string, any>;
}

export class UpdateEmergencyStatusDto {
  @IsEnum(EmergencyRequestStatus)
  status: EmergencyRequestStatus;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class AssignEmergencyDto {
  @IsUUID()
  organizationId: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsBoolean()
  isUrgent?: boolean;
}