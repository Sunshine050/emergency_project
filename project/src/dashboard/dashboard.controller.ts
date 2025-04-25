import {
  Controller,
  Get,
  UseGuards,
} from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.EMERGENCY_CENTER)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  getStats() {
    return this.dashboardService.getStats();
  }

  @Get('active-emergencies')
  getActiveEmergencies() {
    return this.dashboardService.getActiveEmergencies();
  }

  @Get('team-locations')
  getTeamLocations() {
    return this.dashboardService.getTeamLocations();
  }

  @Get('hospital-capacities')
  getHospitalCapacities() {
    return this.dashboardService.getHospitalCapacities();
  }
}