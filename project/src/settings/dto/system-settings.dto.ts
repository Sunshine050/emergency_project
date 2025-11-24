import { IsString, IsOptional, IsEnum } from 'class-validator';

export class SystemSettingsDto {
  @IsString()
  language: string;

  @IsString()
  timeZone: string;

  @IsString()
  dateFormat: string;

  @IsString()
  mapProvider: string;

  @IsString()
  autoRefreshInterval: string;

  @IsOptional()
  @IsEnum(['light', 'dark', 'system'])
  theme?: string;
}
