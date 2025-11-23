import { IsString, IsOptional, IsDateString, IsNumber, IsEnum } from 'class-validator';

export enum ReportType {
  EMERGENCY = 'emergency',
  RESOURCES = 'resources',
  PATIENTS = 'patients',
  PERFORMANCE = 'performance',
  ALL = 'all',
}

export enum ReportPeriod {
  WEEK = 'week',
  MONTH = 'month',
  QUARTER = 'quarter',
  YEAR = 'year',
}

export enum ReportFormat {
  PDF = 'pdf',
  EXCEL = 'excel',
  CSV = 'csv',
}

export class GenerateReportDto {
  @IsEnum(ReportType)
  type: ReportType;

  @IsEnum(ReportPeriod)
  period: ReportPeriod;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsEnum(ReportFormat)
  format?: ReportFormat = ReportFormat.PDF;
}

export class GetReportsQueryDto {
  @IsOptional()
  @IsEnum(ReportType)
  type?: ReportType;

  @IsOptional()
  @IsEnum(ReportPeriod)
  period?: ReportPeriod;

  @IsOptional()
  @IsNumber()
  limit?: number;

  @IsOptional()
  @IsNumber()
  offset?: number;
}
