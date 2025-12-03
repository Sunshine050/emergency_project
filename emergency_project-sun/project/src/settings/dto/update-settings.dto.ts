import { IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { NotificationSettingsDto } from './notification-settings.dto';
import { SystemSettingsDto } from './system-settings.dto';
import { CommunicationSettingsDto } from './communication-settings.dto';
import { ProfileSettingsDto } from './profile-settings.dto';
import { EmergencySettingsDto } from './emergency-settings.dto';

export class UpdateSettingsDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => NotificationSettingsDto)
  notificationSettings?: Partial<NotificationSettingsDto>;

  @IsOptional()
  @ValidateNested()
  @Type(() => SystemSettingsDto)
  systemSettings?: Partial<SystemSettingsDto>;

  @IsOptional()
  @ValidateNested()
  @Type(() => CommunicationSettingsDto)
  communicationSettings?: Partial<CommunicationSettingsDto>;

  @IsOptional()
  @ValidateNested()
  @Type(() => ProfileSettingsDto)
  profileSettings?: Partial<ProfileSettingsDto>;

  @IsOptional()
  @ValidateNested()
  @Type(() => EmergencySettingsDto)
  emergencySettings?: Partial<EmergencySettingsDto>;
}
