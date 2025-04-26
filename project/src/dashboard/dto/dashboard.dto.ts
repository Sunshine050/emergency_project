import { IsString, IsOptional, IsDateString, IsEnum } from "class-validator";

enum ReportType {
  DAILY = "DAILY",
  WEEKLY = "WEEKLY",
  MONTHLY = "MONTHLY",
  CUSTOM = "CUSTOM",
}

export class ReportQueryDto {
  @IsEnum(ReportType)
  type: ReportType;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
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
