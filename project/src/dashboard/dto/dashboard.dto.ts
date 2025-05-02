import { ApiProperty } from "@nestjs/swagger";

export class DashboardStatsResponseDto {
  @ApiProperty()
  totalEmergencies: number;

  @ApiProperty()
  activeEmergencies: number;

  @ApiProperty()
  completedEmergencies: number;

  @ApiProperty()
  cancelledEmergencies: number;

  @ApiProperty()
  averageResponseTime: number;

  @ApiProperty()
  activeTeams: number;

  @ApiProperty()
  availableHospitalBeds: number;

  @ApiProperty()
  connectedHospitals: number;

  @ApiProperty()
  criticalCases: number;
}

export class EmergencyCaseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  severity: number;

  @ApiProperty()
  reportedAt: string;

  @ApiProperty()
  patientName: string;

  @ApiProperty()
  contactNumber: string;

  @ApiProperty()
  emergencyType: string;

  @ApiProperty()
  location: {
    address: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };

  @ApiProperty({ required: false })
  assignedTo?: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  symptoms: string[];
}

export class AssignCaseDto {
  @ApiProperty()
  caseId: string;

  @ApiProperty()
  assignedToId: string;
}

export class CancelCaseDto {
  @ApiProperty()
  caseId: string;
}

export class CreateCaseDto {
  @ApiProperty()
  title: string;

  @ApiProperty()
  patientName: string;

  @ApiProperty({ required: false })
  contactNumber?: string;

  @ApiProperty()
  emergencyType: string;

  @ApiProperty()
  locationAddress: string;

  @ApiProperty({ required: false })
  description?: string;

  @ApiProperty({ minimum: 1, maximum: 4 })
  severity: number;
}