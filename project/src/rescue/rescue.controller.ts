import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  Query,
} from '@nestjs/common';
import { RescueService } from './rescue.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('rescue-teams')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RescueController {
  constructor(private readonly rescueService: RescueService) {}

  // Rescue controller methods will be implemented here
  @Get()
  findAll(@Query() query: any) {
    // Will get all rescue teams with filtering options
    return { message: 'This endpoint will return all rescue teams' };
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    // Will get a specific rescue team
    return { message: `This endpoint will return rescue team with id ${id}` };
  }

  @Post()
  @Roles(UserRole.ADMIN)
  create(@Body() createRescueTeamDto: any) {
    // Will create a new rescue team
    return { message: 'This endpoint will create a new rescue team' };
  }

  @Put(':id')
  @Roles(UserRole.ADMIN, UserRole.RESCUE_TEAM)
  update(@Param('id') id: string, @Body() updateRescueTeamDto: any) {
    // Will update a rescue team
    return { message: `This endpoint will update rescue team with id ${id}` };
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    // Will delete a rescue team
    return { message: `This endpoint will delete rescue team with id ${id}` };
  }

  @Get(':id/availability')
  getAvailability(@Param('id') id: string) {
    // Will get the current availability of a rescue team
    return { message: `This endpoint will return availability for rescue team ${id}` };
  }

  @Put(':id/status')
  @Roles(UserRole.RESCUE_TEAM)
  updateStatus(@Param('id') id: string, @Body() updateStatusDto: any, @CurrentUser() user: any) {
    // Will update the status of a rescue team (available, busy, etc.)
    return { message: `This endpoint will update status of rescue team ${id}` };
  }
}