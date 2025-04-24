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
import { HospitalService } from './hospital.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('hospitals')
@UseGuards(JwtAuthGuard, RolesGuard)
export class HospitalController {
  constructor(private readonly hospitalService: HospitalService) {}

  // Hospital controller methods will be implemented here
  @Get()
  findAll(@Query() query: any) {
    // Will get all hospitals with filtering options
    return { message: 'This endpoint will return all hospitals' };
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    // Will get a specific hospital
    return { message: `This endpoint will return hospital with id ${id}` };
  }

  @Post()
  @Roles(UserRole.ADMIN)
  create(@Body() createHospitalDto: any) {
    // Will create a new hospital
    return { message: 'This endpoint will create a new hospital' };
  }

  @Put(':id')
  @Roles(UserRole.ADMIN, UserRole.HOSPITAL)
  update(@Param('id') id: string, @Body() updateHospitalDto: any) {
    // Will update a hospital
    return { message: `This endpoint will update hospital with id ${id}` };
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    // Will delete a hospital
    return { message: `This endpoint will delete hospital with id ${id}` };
  }

  @Get(':id/capacity')
  getCapacity(@Param('id') id: string) {
    // Will get the current capacity of a hospital
    return { message: `This endpoint will return capacity for hospital ${id}` };
  }
}