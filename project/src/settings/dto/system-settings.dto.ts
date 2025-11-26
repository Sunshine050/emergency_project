import { IsString, IsOptional, IsEnum, IsBoolean, IsNumber, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CaseManagementDto {
  @ApiProperty({ description: 'Auto forward cases to nearest team', default: true })
  @IsBoolean()
  autoForward: boolean;

  @ApiProperty({ description: 'SLA response time in minutes', default: 15 })
  @IsNumber()
  slaResponseTime: number;
}

export class DashboardDto {
  @ApiProperty({ description: 'Dashboard layout preference', default: 'grid' })
  @IsString()
  layout: string;

  @ApiProperty({ description: 'Dashboard refresh interval in seconds', default: 30 })
  @IsNumber()
  refreshInterval: number;
}

export class SystemSettingsDto {
  @ApiProperty({ description: 'Language preference', default: 'th' })
  @IsString()
  language: string;

  @ApiProperty({ description: 'Time zone', default: 'Asia/Bangkok' })
  @IsString()
  timeZone: string;

  @ApiProperty({ description: 'Date format', default: 'DD/MM/YYYY' })
  @IsString()
  dateFormat: string;

  @ApiProperty({ description: 'Map provider', default: 'google' })
  @IsString()
  mapProvider: string;

  @ApiProperty({ description: 'Auto refresh interval', default: '30s' })
  @IsString()
  autoRefreshInterval: string;

  @ApiPropertyOptional({ description: 'Theme preference', enum: ['light', 'dark', 'system'], default: 'system' })
  @IsOptional()
  @IsEnum(['light', 'dark', 'system'])
  theme?: string;

  @ApiProperty({ description: 'Case management settings', type: CaseManagementDto })
  @ValidateNested()
  @Type(() => CaseManagementDto)
  caseManagement: CaseManagementDto;

  @ApiProperty({ description: 'Dashboard settings', type: DashboardDto })
  @ValidateNested()
  @Type(() => DashboardDto)
  dashboard: DashboardDto;
}
