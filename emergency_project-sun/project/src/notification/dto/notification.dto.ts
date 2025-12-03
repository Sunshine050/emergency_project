import { IsString, IsUUID, IsOptional, IsObject } from "class-validator";

export class CreateNotificationDto {
  @IsString()
  type: string;

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

export class MarkAsReadDto {
  @IsUUID()
  notificationId: string;
}
