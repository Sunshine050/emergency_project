import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, Query } from '@nestjs/common';
import { HospitalService } from './hospital.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { CreateHospitalDto, UpdateHospitalDto } from './dto/hospital.dto';

@Controller('hospitals')
@UseGuards(JwtAuthGuard, RolesGuard)
export class HospitalController {
  constructor(private readonly hospitalService: HospitalService) {}

  @Get()
  findAll(@Query() query: any) {
    return this.hospitalService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.hospitalService.findOne(id);
  }

  @Post()
  @Roles(UserRole.ADMIN)
  create(@Body() createHospitalDto: CreateHospitalDto) {
    return this.hospitalService.create(createHospitalDto);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN, UserRole.HOSPITAL)
  update(@Param('id') id: string, @Body() updateHospitalDto: UpdateHospitalDto) {
    return this.hospitalService.update(id, updateHospitalDto);
  }

  @Put(':id/status')
  @Roles(UserRole.ADMIN, UserRole.HOSPITAL)
  updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.hospitalService.update(id, { status });
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.hospitalService.remove(id);
  }

  @Get(':id/capacity')
  getCapacity(@Param('id') id: string) {
    return this.hospitalService.getCapacity(id);
  }
}
