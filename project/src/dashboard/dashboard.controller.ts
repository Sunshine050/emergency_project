import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiBody } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { AssignCaseDto, CancelCaseDto } from './dto/dashboard.dto';

@ApiTags('Dashboard')
@ApiBearerAuth()
@Controller('rescue/dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.EMERGENCY_CENTER)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get dashboard statistics', description: 'Get overall statistics for the rescue dashboard' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - ADMIN or EMERGENCY_CENTER role required' })
  getStats() {
    return this.dashboardService.getStats();
  }

  @Get('active-emergencies')
  @ApiOperation({ summary: 'Get active emergencies', description: 'Get list of all active emergency cases' })
  @ApiResponse({ status: 200, description: 'Active emergencies retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getActiveEmergencies() {
    return this.dashboardService.getActiveEmergencies();
  }

  @Get('team-locations')
  @ApiOperation({ summary: 'Get team locations', description: 'Get current locations of all rescue teams' })
  @ApiResponse({ status: 200, description: 'Team locations retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getTeamLocations() {
    return this.dashboardService.getTeamLocations();
  }

  @Get('hospital-capacities')
  @ApiOperation({ summary: 'Get hospital capacities', description: 'Get current bed capacity information for all hospitals' })
  @ApiResponse({ status: 200, description: 'Hospital capacities retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getHospitalCapacities() {
    return this.dashboardService.getHospitalCapacities();
  }

  @Post('assign-case')
  @ApiOperation({ summary: 'Assign emergency case', description: 'Assign an emergency case to a rescue team or hospital' })
  @ApiBody({ type: AssignCaseDto })
  @ApiResponse({ status: 201, description: 'Case assigned successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Case or team not found' })
  assignCase(@Body() dto: AssignCaseDto) {
    return this.dashboardService.assignCase(dto);
  }

  @Post('cancel-case')
  @ApiOperation({ summary: 'Cancel emergency case', description: 'Cancel an active emergency case' })
  @ApiBody({ type: CancelCaseDto })
  @ApiResponse({ status: 200, description: 'Case cancelled successfully' })
  @ApiResponse({ status: 404, description: 'Case not found' })
  cancelCase(@Body() dto: CancelCaseDto) {
    return this.dashboardService.cancelCase(dto);
  }
}
