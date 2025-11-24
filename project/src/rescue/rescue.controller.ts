import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiParam, ApiBody, ApiQuery } from '@nestjs/swagger';
import { RescueService } from "./rescue.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { UserRole } from "@prisma/client";
import {
  CreateRescueTeamDto,
  UpdateRescueTeamDto,
  UpdateRescueTeamStatusDto,
} from "./dto/rescue.dto";

@ApiTags('Rescue Teams')
@ApiBearerAuth()
@Controller("rescue-teams")
@UseGuards(JwtAuthGuard, RolesGuard)
export class RescueController {
  constructor(private readonly rescueService: RescueService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.RESCUE_TEAM)
  @ApiOperation({ summary: 'Create rescue team', description: 'Create a new rescue team organization' })
  @ApiBody({ type: CreateRescueTeamDto })
  @ApiResponse({ status: 201, description: 'Rescue team created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  create(@Body() createRescueTeamDto: CreateRescueTeamDto) {
    return this.rescueService.create(createRescueTeamDto);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.EMERGENCY_CENTER, UserRole.HOSPITAL)
  @ApiOperation({ summary: 'Get all rescue teams', description: 'Get list of all rescue teams with optional search' })
  @ApiQuery({ name: 'search', required: false, description: 'Search query for rescue team name or location' })
  @ApiResponse({ status: 200, description: 'Rescue teams retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAll(@Query("search") search?: string) {
    return this.rescueService.findAll(search);
  }

  @Get(":id")
  @Roles(UserRole.ADMIN, UserRole.EMERGENCY_CENTER, UserRole.RESCUE_TEAM)
  @ApiOperation({ summary: 'Get rescue team by ID', description: 'Get detailed information about a specific rescue team' })
  @ApiParam({ name: 'id', description: 'Rescue team ID' })
  @ApiResponse({ status: 200, description: 'Rescue team retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Rescue team not found' })
  findOne(@Param("id") id: string) {
    return this.rescueService.findOne(id);
  }

  @Put(":id")
  @Roles(UserRole.ADMIN, UserRole.RESCUE_TEAM)
  @ApiOperation({ summary: 'Update rescue team', description: 'Update rescue team information' })
  @ApiParam({ name: 'id', description: 'Rescue team ID' })
  @ApiBody({ type: UpdateRescueTeamDto })
  @ApiResponse({ status: 200, description: 'Rescue team updated successfully' })
  @ApiResponse({ status: 404, description: 'Rescue team not found' })
  update(
    @Param("id") id: string,
    @Body() updateRescueTeamDto: UpdateRescueTeamDto,
  ) {
    return this.rescueService.update(id, updateRescueTeamDto);
  }

  @Put(":id/status")
  @Roles(UserRole.RESCUE_TEAM)
  @ApiOperation({ summary: 'Update rescue team status', description: 'Update the availability status of a rescue team' })
  @ApiParam({ name: 'id', description: 'Rescue team ID' })
  @ApiBody({ type: UpdateRescueTeamStatusDto })
  @ApiResponse({ status: 200, description: 'Status updated successfully' })
  @ApiResponse({ status: 404, description: 'Rescue team not found' })
  updateStatus(
    @Param("id") id: string,
    @Body() updateStatusDto: UpdateRescueTeamStatusDto,
  ) {
    return this.rescueService.updateStatus(id, updateStatusDto);
  }

  @Get("available")
  @Roles(UserRole.EMERGENCY_CENTER)
  @ApiOperation({ summary: 'Find available rescue teams', description: 'Find available rescue teams within a specified radius' })
  @ApiQuery({ name: 'latitude', description: 'Latitude coordinate' })
  @ApiQuery({ name: 'longitude', description: 'Longitude coordinate' })
  @ApiQuery({ name: 'radius', required: false, description: 'Search radius in kilometers (default: 10)' })
  @ApiResponse({ status: 200, description: 'Available rescue teams retrieved successfully' })
  findAvailableTeams(
    @Query("latitude") latitude: number,
    @Query("longitude") longitude: number,
    @Query("radius") radius: number = 10,
  ) {
    return this.rescueService.findAvailableTeams(latitude, longitude, radius);
  }
}
