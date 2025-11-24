import { IsString, IsOptional } from 'class-validator';

export class ProfileSettingsDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsOptional()
  @IsString()
  phone?: string;
}
