import { Controller, Post, Get, Put, Param, Body, UseGuards } from "@nestjs/common";
import { SosService } from "./sos.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { GetUser } from "../auth/decorators/get-user.decorator";
import { UserRole } from "@prisma/client";
import {
  CreateEmergencyRequestDto,
  UpdateEmergencyStatusDto,
} from "./dto/sos.dto";

@Controller("sos")
@UseGuards(JwtAuthGuard, RolesGuard)
export class SosController {
  constructor(private readonly sosService: SosService) {}

  @Post()
  @Roles(UserRole.PATIENT, UserRole.EMERGENCY_CENTER)
  createEmergencyRequest(
    @Body() createSosDto: CreateEmergencyRequestDto,
    @GetUser() user: any,
  ) {
    console.log('createEmergencyRequest called with user:', user.id, 'and type:', createSosDto.type);
    return this.sosService.createEmergencyRequest(createSosDto, user.id);
  }

  @Post(":id/assign")
  @Roles(UserRole.EMERGENCY_CENTER)
  async assignToHospital(
    @Param("id") id: string,
    @Body() assignDto: { hospitalId: string },
    @GetUser() user: any,
  ) {
    console.log('assignToHospital called with id:', id, 'and hospitalId:', assignDto.hospitalId);
    return this.sosService.assignToHospital(id, assignDto.hospitalId, user.id);
  }

  @Put(":id/status")
  @Roles(UserRole.EMERGENCY_CENTER, UserRole.HOSPITAL, UserRole.RESCUE_TEAM)
  updateStatus(
    @Param("id") id: string,
    @Body() updateStatusDto: UpdateEmergencyStatusDto,
  ) {
    console.log('updateStatus called with id:', id);
    return this.sosService.updateStatus(id, updateStatusDto);
  }

  @Get()
  @Roles(UserRole.PATIENT)
  async getEmergencyRequests(@GetUser() user: any) {
    console.log('getEmergencyRequests called for user:', user.id);
    return this.sosService.getEmergencyRequests(user.id);
  }

  @Get('all')
  @Roles(UserRole.EMERGENCY_CENTER, UserRole.HOSPITAL, UserRole.RESCUE_TEAM)
  async getAllEmergencyRequests() {
    console.log('getAllEmergencyRequests called');
    console.log('Expected roles:', [UserRole.EMERGENCY_CENTER, UserRole.HOSPITAL, UserRole.RESCUE_TEAM]);
    return this.sosService.getAllEmergencyRequests();
  }

  @Get('dashboard/active-emergencies')
  @Roles(UserRole.EMERGENCY_CENTER, UserRole.HOSPITAL, UserRole.RESCUE_TEAM)
  async getActiveEmergencies(@GetUser() user: any) {
    console.log('getActiveEmergencies called for user:', user.email, 'role:', user.role);
    
    if (user.role === UserRole.HOSPITAL && user.organizationId) {
      return this.sosService.findActiveEmergenciesByHospital(user.organizationId);
    }
    
    return this.sosService.getAllEmergencyRequests();
  }

  @Get(':id')
  @Roles(UserRole.PATIENT)
  async getEmergencyRequestById(@Param('id') id: string, @GetUser() user: any) {
    console.log('getEmergencyRequestById called with id:', id);
    return this.sosService.getEmergencyRequestById(id, user.id);
  }
}