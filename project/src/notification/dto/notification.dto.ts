import { IsString, IsOptional, IsUUID, IsBoolean, IsObject, IsEnum } from 'class-validator';

enum NotificationType {
  EMERGENCY = 'EMERGENCY',
  STATUS_UPDATE = 'STATUS_UPDATE',
  SYSTEM = 'SYSTEM',
  ASSIGNMENT = 'ASSIGNMENT',
}

export class CreateNotificationDto {
  @IsEnum(NotificationType)
  type: NotificationType;

  @IsString()
  title: string;

  @IsString()
  body: string;

  @IsUUID()
  userId: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class NotificationQueryDto {
  @IsOptional()
  @IsBoolean()
  unreadOnly?: boolean;

  @IsOptional()
  @IsEnum(NotificationType)
  type?: NotificationType;

  @IsOptional()
  @IsString()
  search?: string;
}

export class MarkAsReadDto {
  @IsUUID(4, { each: true })
  notificationIds: string[];
}