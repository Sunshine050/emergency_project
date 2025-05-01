import { Controller, Post, Get, Put, Param, Body, UseGuards } from '@nestjs/common';
import { SosService } from './sos.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
  CreateEmergencyRequestDto,
  UpdateEmergencyStatusDto,
  EmergencyResponseDto,
} from './dto/sos.dto';
import { NotificationGateway } from '../notification/notification.gateway';

@ApiTags('SOS')
@Controller('sos')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SosController {
  constructor(
    private readonly sosService: SosService,
    private readonly notificationGateway: NotificationGateway,
  ) {}

  @Post()
  @Roles(UserRole.PATIENT)
  @ApiOperation({ summary: 'Create a new emergency request' })
  @ApiResponse({ status: 201, description: 'Emergency request created', type: EmergencyResponseDto })
  async createEmergencyRequest(
    @Body() createSosDto: CreateEmergencyRequestDto,
    @CurrentUser() user: any,
  ): Promise<EmergencyResponseDto> {
    const newEmergency = await this.sosService.createEmergencyRequest(createSosDto, user.id);
    // ส่ง WebSocket event สำหรับ emergency ใหม่
    this.notificationGateway.broadcastEmergency({
      id: newEmergency.id,
      type: newEmergency.emergencyType,
      grade: newEmergency.severity === 4 ? 'CRITICAL' : newEmergency.severity === 3 ? 'URGENT' : 'NORMAL',
      location: {
        address: newEmergency.location.address,
      },
      coordinates: {
        latitude: newEmergency.location.coordinates.lat,
        longitude: newEmergency.location.coordinates.lng,
      },
    });
    return newEmergency;
  }

  @Put(':id/status')
  @Roles(UserRole.EMERGENCY_CENTER, UserRole.HOSPITAL, UserRole.RESCUE_TEAM)
  @ApiOperation({ summary: 'Update the status of an emergency request' })
  @ApiResponse({ status: 200, description: 'Status updated', type: EmergencyResponseDto })
  async updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateEmergencyStatusDto,
  ): Promise<EmergencyResponseDto> {
    const updatedEmergency = await this.sosService.updateStatus(id, updateStatusDto);
    // ส่ง WebSocket event สำหรับการอัปเดตสถานะ
    this.notificationGateway.broadcastStatusUpdate({
      emergencyId: id,
      status: updatedEmergency.status,
      assignedTo: updatedEmergency.assignedTo,
    });
    return updatedEmergency;
  }

  @Get()
  @Roles(UserRole.PATIENT)
  @ApiOperation({ summary: 'Get all emergency requests for a patient' })
  @ApiResponse({ status: 200, description: 'Emergency requests retrieved', type: [EmergencyResponseDto] })
  async getEmergencyRequests(@CurrentUser() user: any): Promise<EmergencyResponseDto[]> {
    return this.sosService.getEmergencyRequests(user.id);
  }

  @Get('all')
  @Roles(UserRole.EMERGENCY_CENTER, UserRole.HOSPITAL, UserRole.RESCUE_TEAM)
  @ApiOperation({ summary: 'Get all emergency requests (for responders)' })
  @ApiResponse({ status: 200, description: 'Emergency requests retrieved', type: [EmergencyResponseDto] })
  async getAllEmergencyRequests(): Promise<EmergencyResponseDto[]> {
    return this.sosService.getAllEmergencyRequests();
  }

  @Get(':id')
  @Roles(UserRole.PATIENT)
  @ApiOperation({ summary: 'Get a specific emergency request by ID' })
  @ApiResponse({ status: 200, description: 'Emergency request retrieved', type: EmergencyResponseDto })
  async getEmergencyRequestById(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ): Promise<EmergencyResponseDto> {
    return this.sosService.getEmergencyRequestById(id, user.id);
  }
}