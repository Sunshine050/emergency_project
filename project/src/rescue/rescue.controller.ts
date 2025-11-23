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

@Controller("rescue-teams")
@UseGuards(JwtAuthGuard, RolesGuard)
export class RescueController {
  constructor(private readonly rescueService: RescueService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.RESCUE_TEAM)
  create(@Body() createRescueTeamDto: CreateRescueTeamDto) {
    return this.rescueService.create(createRescueTeamDto);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.EMERGENCY_CENTER, UserRole.HOSPITAL)
  findAll(@Query("search") search?: string) {
    return this.rescueService.findAll(search);
  }

  @Get(":id")
  @Roles(UserRole.ADMIN, UserRole.EMERGENCY_CENTER, UserRole.RESCUE_TEAM)
  findOne(@Param("id") id: string) {
    return this.rescueService.findOne(id);
  }

  @Put(":id")
  @Roles(UserRole.ADMIN, UserRole.RESCUE_TEAM)
  update(
    @Param("id") id: string,
    @Body() updateRescueTeamDto: UpdateRescueTeamDto,
  ) {
    return this.rescueService.update(id, updateRescueTeamDto);
  }

  @Put(":id/status")
  @Roles(UserRole.RESCUE_TEAM)
  updateStatus(
    @Param("id") id: string,
    @Body() updateStatusDto: UpdateRescueTeamStatusDto,
  ) {
    return this.rescueService.updateStatus(id, updateStatusDto);
  }

  @Get("available")
  @Roles(UserRole.EMERGENCY_CENTER)
  findAvailableTeams(
    @Query("latitude") latitude: number,
    @Query("longitude") longitude: number,
    @Query("radius") radius: number = 10,
  ) {
    return this.rescueService.findAvailableTeams(latitude, longitude, radius);
  }
}
