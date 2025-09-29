import { IsString, IsOptional, IsNumber } from 'class-validator';

export class ReportQueryDto {
  @IsString()
  type: string;

  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;

  @IsOptional()
  @IsString()
  region?: string;

  @IsOptional()
  @IsString()
  category?: string;
}

export class DashboardStatsResponseDto {
  totalEmergencies: number;
  activeEmergencies: number;
  completedEmergencies: number;
  cancelledEmergencies: number;
  averageResponseTime: number;
  activeTeams: number;
  availableHospitalBeds: number;
}

export class CreateEmergencyCaseDto {
  @IsString()
  title: string;

  @IsString()
  patientName: string;

  @IsOptional()
  @IsString()
  contactNumber?: string;

  @IsString()
  emergencyType: string;

  @IsString()
  locationAddress: string;

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  severity: number;
}