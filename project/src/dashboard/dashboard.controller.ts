import { Controller, Get, Post, Body, UseGuards, Query, Request } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { ReportQueryDto, CreateEmergencyCaseDto } from './dto/dashboard.dto';

@Controller('dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  @Roles(UserRole.ADMIN, UserRole.EMERGENCY_CENTER)
  getStats() {
    return this.dashboardService.getStats();
  }

  @Get('active-emergencies')
  @Roles(
    UserRole.ADMIN,
    UserRole.EMERGENCY_CENTER,
    UserRole.HOSPITAL,
    UserRole.RESCUE_TEAM
  )
  getActiveEmergencies() {
    return this.dashboardService.getActiveEmergencies();
  }

  @Get('team-locations')
  @Roles(UserRole.ADMIN, UserRole.EMERGENCY_CENTER)
  getTeamLocations() {
    return this.dashboardService.getTeamLocations();
  }

  @Get('hospital-capacities')
  @Roles(UserRole.ADMIN, UserRole.EMERGENCY_CENTER, UserRole.HOSPITAL)
  getHospitalCapacities() {
    return this.dashboardService.getHospitalCapacities();
  }

  @Get('reports')
  @Roles(UserRole.ADMIN, UserRole.EMERGENCY_CENTER)
  getReports(@Query() query: ReportQueryDto) {
    return this.dashboardService.getReports(query);
  }

  @Post('create-case')
  @Roles(UserRole.ADMIN, UserRole.EMERGENCY_CENTER)
  async createCase(@Body() createCaseDto: CreateEmergencyCaseDto, @Request() req) {
    return this.dashboardService.createCase(createCaseDto, req);
  }

  @Post('cancel-case')
  @Roles(UserRole.ADMIN, UserRole.EMERGENCY_CENTER)
  async cancelCase(@Body() body: { caseId: string }, @Request() req) {
    return this.dashboardService.cancelCase(body.caseId, req);
  }
}