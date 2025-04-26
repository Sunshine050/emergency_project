import { Controller, Post, Body, Put, Param, UseGuards } from "@nestjs/common";
import { SosService } from "./sos.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import {
  CreateEmergencyRequestDto,
  UpdateEmergencyStatusDto,
} from "./dto/sos.dto";
import { UserRole } from "@prisma/client";

@Controller("sos")
@UseGuards(JwtAuthGuard, RolesGuard)
export class SosController {
  constructor(private readonly sosService: SosService) {}

  @Post()
  @Roles(UserRole.PATIENT)
  createEmergencyRequest(
    @Body() createSosDto: CreateEmergencyRequestDto,
    @CurrentUser() user: any,
  ) {
    return this.sosService.createEmergencyRequest(createSosDto, user.id);
  }

  @Put(":id/status")
  @Roles(UserRole.EMERGENCY_CENTER, UserRole.HOSPITAL, UserRole.RESCUE_TEAM)
  updateStatus(
    @Param("id") id: string,
    @Body() updateStatusDto: UpdateEmergencyStatusDto,
  ) {
    return this.sosService.updateStatus(id, updateStatusDto);
  }
}
