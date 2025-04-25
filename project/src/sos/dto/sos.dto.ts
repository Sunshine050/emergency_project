import { IsString, IsOptional, IsNumber, IsEnum, IsObject } from 'class-validator';

export enum EmergencyGrade {
  CRITICAL = 'CRITICAL',
  URGENT = 'URGENT',
  NON_URGENT = 'NON_URGENT'
}

export enum EmergencyType {
  ACCIDENT = 'ACCIDENT',
  MEDICAL = 'MEDICAL',
  FIRE = 'FIRE',
  CRIME = 'CRIME',
  OTHER = 'OTHER'
}

export enum EmergencyStatus {
  PENDING = 'PENDING',
  ASSIGNED = 'ASSIGNED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
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

  @IsEnum(EmergencyGrade)
  grade: EmergencyGrade;

  @IsEnum(EmergencyType)
  type: EmergencyType;

  @IsOptional()
  @IsObject()
  medicalInfo?: Record<string, any>;
}

export class UpdateEmergencyStatusDto {
  @IsEnum(EmergencyStatus)
  status: EmergencyStatus;

  @IsOptional()
  @IsString()
  notes?: string;
}