import { IsString, IsEmail } from 'class-validator';

export class CommunicationSettingsDto {
  @IsString()
  primaryContactNumber: string;

  @IsString()
  backupContactNumber: string;

  @IsEmail()
  emergencyEmail: string;

  @IsString()
  broadcastChannel: string;
}
