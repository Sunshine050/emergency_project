import { IsBoolean } from 'class-validator';

export class NotificationSettingsDto {
  @IsBoolean()
  emergencyAlerts: boolean;

  @IsBoolean()
  statusUpdates: boolean;

  @IsBoolean()
  systemNotifications: boolean;

  @IsBoolean()
  soundEnabled: boolean;

  @IsBoolean()
  emailNotifications: boolean;

  @IsBoolean()
  smsNotifications: boolean;
}
