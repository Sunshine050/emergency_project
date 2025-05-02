import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { DashboardStatsResponseDto, EmergencyCaseDto, AssignCaseDto, CancelCaseDto } from './dto/dashboard.dto';
import { CreateCaseDto } from './dto/dashboard.dto'; // เพิ่ม DTO ใหม่

class TeamLocationResponseDto {
  id: string;
  name: string;
  type: string;
  location: {
    address: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  status: string;
}

class HospitalCapacityResponseDto {
  id: string;
  name: string;
  type: string;
  capacity: number;
  availableBeds: number;
  location: {
    address: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
}

@ApiTags('Dashboard')
@Controller('dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.EMERGENCY_CENTER)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get dashboard statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully', type: DashboardStatsResponseDto })
  async getStats(): Promise<DashboardStatsResponseDto> {
    return this.dashboardService.getStats();
  }

  @Get('active-emergencies')
  @ApiOperation({ summary: 'Get active emergency cases' })
  @ApiResponse({ status: 200, description: 'Active emergencies retrieved successfully', type: [EmergencyCaseDto] })
  async getActiveEmergencies(): Promise<EmergencyCaseDto[]> {
    return this.dashboardService.getActiveEmergencies();
  }

  @Get('team-locations')
  @ApiOperation({ summary: 'Get locations of active rescue teams' })
  @ApiResponse({ status: 200, description: 'Team locations retrieved successfully', type: [TeamLocationResponseDto] })
  async getTeamLocations(): Promise<TeamLocationResponseDto[]> {
    return this.dashboardService.getTeamLocations();
  }

  @Get('hospital-capacities')
  @ApiOperation({ summary: 'Get hospital capacities' })
  @ApiResponse({ status: 200, description: 'Hospital capacities retrieved successfully', type: [HospitalCapacityResponseDto] })
  async getHospitalCapacities(): Promise<HospitalCapacityResponseDto[]> {
    return this.dashboardService.getHospitalCapacities();
  }

  @Post('assign-case')
  @ApiOperation({ summary: 'Assign an emergency case to a hospital or rescue team' })
  @ApiBody({ type: AssignCaseDto })
  @ApiResponse({ status: 200, description: 'Case assigned successfully', type: EmergencyCaseDto })
  async assignCase(@Body() assignCaseDto: AssignCaseDto): Promise<EmergencyCaseDto> {
    return this.dashboardService.assignCase(assignCaseDto.caseId, assignCaseDto.assignedToId);
  }

  @Post('cancel-case')
  @ApiOperation({ summary: 'Cancel an emergency case' })
  @ApiBody({ type: CancelCaseDto })
  @ApiResponse({ status: 200, description: 'Case cancelled successfully', type: EmergencyCaseDto })
  async cancelCase(@Body() cancelCaseDto: CancelCaseDto): Promise<EmergencyCaseDto> {
    return this.dashboardService.cancelCase(cancelCaseDto.caseId);
  }

  @Post('create-case')
  @ApiOperation({ summary: 'Create a new emergency case' })
  @ApiBody({ type: CreateCaseDto })
  @ApiResponse({ status: 201, description: 'Case created successfully', type: EmergencyCaseDto })
  async createCase(@Body() createCaseDto: CreateCaseDto): Promise<EmergencyCaseDto> {
    return this.dashboardService.createCase(createCaseDto);
  }
}