import { ApiProperty } from "@nestjs/swagger";
import {
  IsString,
  IsOptional,
  IsNumber,
  IsEnum,
  IsObject,
  IsArray,
} from "class-validator";

export enum EmergencyGrade {
  CRITICAL = "CRITICAL",
  URGENT = "URGENT",
  NON_URGENT = "NON_URGENT",
}

export enum EmergencyType {
  ACCIDENT = "ACCIDENT",
  MEDICAL = "MEDICAL",
  FIRE = "FIRE",
  CRIME = "CRIME",
  OTHER = "OTHER",
}

export enum EmergencyStatus {
  PENDING = "PENDING",
  ASSIGNED = "ASSIGNED",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export class CreateEmergencyRequestDto {
  @ApiProperty({ description: "Description of the emergency" })
  @IsString()
  description: string;

  @ApiProperty({ description: "Location address", required: false })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({ description: "Latitude of the location", required: false })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiProperty({ description: "Longitude of the location", required: false })
  @IsOptional()
  @IsNumber()
  longitude?: number;

  @ApiProperty({ enum: EmergencyGrade, description: "Grade of the emergency" })
  @IsEnum(EmergencyGrade)
  grade: EmergencyGrade;

  @ApiProperty({ enum: EmergencyType, description: "Type of the emergency" })
  @IsEnum(EmergencyType)
  type: EmergencyType;

  @ApiProperty({ description: "Additional medical information", required: false })
  @IsOptional()
  @IsObject()
  medicalInfo?: Record<string, any>;

  @ApiProperty({ description: "Symptoms reported", required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  symptoms?: string[];
}

export class UpdateEmergencyStatusDto {
  @ApiProperty({ enum: EmergencyStatus, description: "New status of the emergency" })
  @IsEnum(EmergencyStatus)
  status: EmergencyStatus;

  @ApiProperty({ description: "Additional notes", required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ description: "ID of the organization to assign to", required: false })
  @IsOptional()
  @IsString()
  assignedToId?: string;
}

export class EmergencyResponseDto {
  @ApiProperty({ description: "ID of the emergency request" })
  id: string;

  @ApiProperty({ description: "Title of the emergency request" })
  title: string;

  @ApiProperty({ description: "Status of the emergency request" })
  status: string;

  @ApiProperty({ description: "Severity of the emergency (1-4)" })
  severity: number;

  @ApiProperty({ description: "Timestamp when the emergency was reported" })
  reportedAt: string;

  @ApiProperty({ description: "Name of the patient" })
  patientName: string;

  @ApiProperty({ description: "Contact number of the patient" })
  contactNumber: string;

  @ApiProperty({ description: "Type of the emergency" })
  emergencyType: string;

  @ApiProperty({ description: "Location of the emergency" })
  location: {
    address: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };

  @ApiProperty({ description: "Description of the emergency" })
  description: string;

  @ApiProperty({ description: "Symptoms reported" })
  symptoms: string[];

  @ApiProperty({ description: "Assigned organization", required: false })
  assignedTo?: string;
}