import { IsString, IsOptional, IsNumber, IsEmail, IsUUID } from 'class-validator';

export class CreateHospitalDto {
  @IsString()
  name: string;

  @IsString()
  address: string;

  @IsString()
  city: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsString()
  postalCode: string;

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;

  @IsString()
  contactPhone: string;

  @IsOptional()
  @IsEmail()
  contactEmail?: string;
}

export class UpdateHospitalDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  postalCode?: string;

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;

  @IsOptional()
  @IsString()
  contactPhone?: string;

  @IsOptional()
  @IsEmail()
  contactEmail?: string;
}

export class HospitalCapacityDto {
  @IsUUID()
  hospitalId: string;

  @IsNumber()
  totalBeds: number;

  @IsNumber()
  availableBeds: number;

  @IsOptional()
  @IsNumber()
  icuTotal?: number;

  @IsOptional()
  @IsNumber()
  icuAvailable?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}