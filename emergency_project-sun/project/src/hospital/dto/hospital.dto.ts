import {
  IsString,
  IsOptional,
  IsNumber,
  IsEmail,
  IsUUID,
  IsEnum,
} from "class-validator";

export enum HospitalStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  MAINTENANCE = "MAINTENANCE",
}

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

  @IsNumber()
  latitude: number;

  @IsNumber()
  longitude: number;

  @IsString()
  contactPhone: string;

  @IsOptional()
  @IsEmail()
  contactEmail?: string;

  @IsOptional()
  @IsNumber()
  totalBeds?: number;

  @IsOptional()
  @IsNumber()
  availableBeds?: number;

  @IsOptional()
  @IsNumber()
  icuBeds?: number;

  @IsOptional()
  @IsNumber()
  availableIcuBeds?: number;
}

export class UpdateHospitalDto extends CreateHospitalDto {
  @IsOptional()
  @IsEnum(HospitalStatus)
  status?: HospitalStatus;
}

export class UpdateHospitalCapacityDto {
  @IsNumber()
  totalBeds: number;

  @IsNumber()
  availableBeds: number;

  @IsNumber()
  icuBeds: number;

  @IsNumber()
  availableIcuBeds: number;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class AcceptEmergencyDto {
  @IsUUID()
  emergencyId: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
