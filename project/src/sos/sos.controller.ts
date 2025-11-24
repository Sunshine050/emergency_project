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
  @ApiOperation({ summary: 'Create emergency request', description: 'Create a new SOS emergency request (PATIENT or EMERGENCY_CENTER)' })
  @ApiBody({ type: CreateEmergencyRequestDto })
  @ApiResponse({ status: 201, description: 'Emergency request created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  createEmergencyRequest(
    @Body() createSosDto: CreateEmergencyRequestDto,
    @GetUser() user: any,
  ) {
    console.log('createEmergencyRequest called with user:', user.id, 'and type:', createSosDto.type);
    return this.sosService.createEmergencyRequest(createSosDto, user.id);
  }

  @Post(":id/assign")
  @Roles(UserRole.EMERGENCY_CENTER)
  @ApiOperation({ summary: 'Assign emergency to hospital', description: 'Assign an emergency request to a specific hospital (EMERGENCY_CENTER only)' })
  @ApiParam({ name: 'id', description: 'Emergency request ID' })
  @ApiBody({ schema: { type: 'object', properties: { hospitalId: { type: 'string', description: 'Hospital organization ID' } } } })
  @ApiResponse({ status: 200, description: 'Emergency assigned to hospital successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - EMERGENCY_CENTER role required' })
  @ApiResponse({ status: 404, description: 'Emergency request or hospital not found' })
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
  @ApiOperation({ summary: 'Update emergency status', description: 'Update the status of an emergency request' })
  @ApiParam({ name: 'id', description: 'Emergency request ID' })
  @ApiBody({ type: UpdateEmergencyStatusDto })
  @ApiResponse({ status: 200, description: 'Emergency status updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Emergency request not found' })
  updateStatus(
    @Param("id") id: string,
    @Body() updateStatusDto: UpdateEmergencyStatusDto,
  ) {
    console.log('updateStatus called with id:', id);
    return this.sosService.updateStatus(id, updateStatusDto);
  }

  @Get()
  @Roles(UserRole.PATIENT)
  @ApiOperation({ summary: 'Get my emergency requests', description: 'Get all emergency requests created by the authenticated patient' })
  @ApiResponse({ status: 200, description: 'Emergency requests retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - PATIENT role required' })
  async getEmergencyRequests(@GetUser() user: any) {
    console.log('getEmergencyRequests called for user:', user.id);
    return this.sosService.getEmergencyRequests(user.id);
  }

  @Get('all')
  @Roles(UserRole.EMERGENCY_CENTER, UserRole.HOSPITAL, UserRole.RESCUE_TEAM)
  @ApiOperation({ summary: 'Get all emergency requests', description: 'Get all emergency requests in the system (staff only)' })
  @ApiResponse({ status: 200, description: 'All emergency requests retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Staff role required' })
  async getAllEmergencyRequests() {
    console.log('getAllEmergencyRequests called');
    console.log('Expected roles:', [UserRole.EMERGENCY_CENTER, UserRole.HOSPITAL, UserRole.RESCUE_TEAM]);
    return this.sosService.getAllEmergencyRequests();
  }

  @Get('dashboard/active-emergencies')
  @Roles(UserRole.EMERGENCY_CENTER, UserRole.HOSPITAL, UserRole.RESCUE_TEAM)
  @ApiOperation({ summary: 'Get active emergencies for dashboard', description: 'Get active emergencies (filtered by hospital if HOSPITAL role)' })
  @ApiResponse({ status: 200, description: 'Active emergencies retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Staff role required' })
  async getActiveEmergencies(@GetUser() user: any) {
    console.log('getActiveEmergencies called for user:', user.email, 'role:', user.role);
    
    if (user.role === UserRole.HOSPITAL && user.organizationId) {
      return this.sosService.findActiveEmergenciesByHospital(user.organizationId);
    }
    
    return this.sosService.getAllEmergencyRequests();
  }

  @Get(':id')
  @Roles(UserRole.PATIENT)
  @ApiOperation({ summary: 'Get emergency request by ID', description: 'Get a specific emergency request by ID (patient only)' })
  @ApiParam({ name: 'id', description: 'Emergency request ID' })
  @ApiResponse({ status: 200, description: 'Emergency request retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - PATIENT role required' })
  @ApiResponse({ status: 404, description: 'Emergency request not found' })
  async getEmergencyRequestById(@Param('id') id: string, @GetUser() user: any) {
    console.log('getEmergencyRequestById called with id:', id);
    return this.sosService.getEmergencyRequestById(id, user.id);
  }
}