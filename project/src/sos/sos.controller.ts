import { Controller, Post, Get, Put, Param, Body, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
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

@ApiTags('SOS / Emergency Requests')
@ApiBearerAuth()
@Controller("sos")
@UseGuards(JwtAuthGuard, RolesGuard)
export class SosController {
  constructor(private readonly sosService: SosService) {}

  @Post()
  @Roles(UserRole.PATIENT, UserRole.EMERGENCY_CENTER)
  @ApiOperation({ summary: 'Create emergency request' })
  @ApiBody({ type: CreateEmergencyRequestDto })
  createEmergencyRequest(
    @Body() createSosDto: CreateEmergencyRequestDto,
    @GetUser() user: any,
  ) {
    return this.sosService.createEmergencyRequest(createSosDto, user.id);
  }

  @Post(":id/assign")
  @Roles(UserRole.EMERGENCY_CENTER)
  @ApiOperation({ summary: 'Assign emergency to hospital' })
  @ApiParam({ name: 'id' })
  @ApiBody({ schema: { type: 'object', properties: { hospitalId: { type: 'string' } } } })
  async assignToHospital(
    @Param("id") id: string,
    @Body() assignDto: { hospitalId: string },
    @GetUser() user: any,
  ) {
    return this.sosService.assignToHospital(id, assignDto.hospitalId, user.id);
  }

  @Put(":id/status")
  @Roles(UserRole.EMERGENCY_CENTER, UserRole.HOSPITAL, UserRole.RESCUE_TEAM)
  @ApiOperation({ summary: 'Update emergency status' })
  @ApiParam({ name: 'id' })
  @ApiBody({ type: UpdateEmergencyStatusDto })
  updateStatus(
    @Param("id") id: string,
    @Body() updateStatusDto: UpdateEmergencyStatusDto,
  ) {
    return this.sosService.updateStatus(id, updateStatusDto);
  }

  @Get()
  @Roles(UserRole.PATIENT)
  @ApiOperation({ summary: 'Get my emergency requests' })
  async getEmergencyRequests(@GetUser() user: any) {
    return this.sosService.getEmergencyRequests(user.id);
  }

  @Get('all')
  @Roles(UserRole.EMERGENCY_CENTER, UserRole.HOSPITAL, UserRole.RESCUE_TEAM)
  @ApiOperation({ summary: 'Get all emergency requests' })
  async getAllEmergencyRequests() {
    return this.sosService.getAllEmergencyRequests();
  }

  @Get('dashboard/active-emergencies')
  @Roles(UserRole.EMERGENCY_CENTER, UserRole.HOSPITAL, UserRole.RESCUE_TEAM)
  @ApiOperation({ summary: 'Get active emergencies for dashboard' })
  async getActiveEmergencies(@GetUser() user: any) {
    if (user.role === UserRole.HOSPITAL && user.organizationId) {
      return this.sosService.findActiveEmergenciesByHospital(user.organizationId);
    }
    return this.sosService.getAllEmergencyRequests();
  }

  @Get('rescue/assigned-cases')
  @Roles(UserRole.RESCUE_TEAM)
  @ApiOperation({ summary: 'Get assigned cases for rescue team' })
  async getAssignedCases(@GetUser() user: any) {
    if (!user.organizationId) {
      return [];
    }
    return this.sosService.findCasesByRescueTeam(user.organizationId);
  }

  @Get(':id')
  @Roles(UserRole.PATIENT)
  @ApiOperation({ summary: 'Get emergency request by ID' })
  @ApiParam({ name: 'id' })
  async getEmergencyRequestById(@Param('id') id: string, @GetUser() user: any) {
    return this.sosService.getEmergencyRequestById(id, user.id);
  }
}
