import { IsNumber, IsEnum } from 'class-validator';

export class EmergencySettingsDto {
  @IsNumber()
  defaultRadius: number;

  @IsEnum(['CRITICAL', 'URGENT', 'NON_URGENT'])
  minUrgencyLevel: string;
}
