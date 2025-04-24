import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  UseGuards,
  Query,
} from '@nestjs/common';
import { SosService } from './sos.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('sos')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SosController {
  constructor(private readonly sosService: SosService) {}

  // SOS controller methods will be implemented here
  @Post()
  createEmergencyRequest(@Body() createSosDto: any, @CurrentUser() user: any) {
    // Will create a new emergency request
    return { message: 'This endpoint will create a new emergency request' };
  }

  @Get()
  findAll(@Query() query: any) {
    // Will get all emergency requests with filtering options
    return { message: 'This endpoint will get all emergency requests' };
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    // Will get a specific emergency request
    return { message: `This endpoint will get emergency request with id ${id}` };
  }

  @Put(':id/status')
  updateStatus(@Param('id') id: string, @Body() updateStatusDto: any) {
    // Will update the status of an emergency request
    return { message: `This endpoint will update status of emergency request ${id}` };
  }

  @Post(':id/assign')
  @Roles(UserRole.EMERGENCY_CENTER)
  assignEmergency(@Param('id') id: string, @Body() assignDto: any) {
    // Will assign an emergency to a rescue team or hospital
    return { message: `This endpoint will assign emergency ${id} to a responder` };
  }
}