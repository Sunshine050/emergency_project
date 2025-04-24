import {
  Controller,
  Get,
  UseGuards,
  Query,
} from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  // Dashboard controller methods will be implemented here
  @Get('stats')
  @Roles(UserRole.ADMIN, UserRole.EMERGENCY_CENTER)
  getStats() {
    // Will return overall statistics
    return { message: 'This endpoint will return overall emergency statistics' };
  }

  @Get('active-emergencies')
  @Roles(UserRole.ADMIN, UserRole.EMERGENCY_CENTER, UserRole.HOSPITAL, UserRole.RESCUE_TEAM)
  getActiveEmergencies() {
    // Will return currently active emergencies
    return { message: 'This endpoint will return all active emergencies' };
  }

  @Get('team-locations')
  @Roles(UserRole.ADMIN, UserRole.EMERGENCY_CENTER)
  getTeamLocations() {
    // Will return locations of all rescue teams
    return { message: 'This endpoint will return locations of all rescue teams' };
  }

  @Get('hospital-capacities')
  @Roles(UserRole.ADMIN, UserRole.EMERGENCY_CENTER, UserRole.HOSPITAL)
  getHospitalCapacities() {
    // Will return capacities of all hospitals
    return { message: 'This endpoint will return capacities of all hospitals' };
  }

  @Get('reports')
  @Roles(UserRole.ADMIN, UserRole.EMERGENCY_CENTER)
  getReports(@Query() query: any) {
    // Will return reports based on query parameters
    return { message: 'This endpoint will return reports based on query parameters' };
  }
}