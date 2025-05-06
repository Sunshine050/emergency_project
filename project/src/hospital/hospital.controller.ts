import { Controller, Get, Post, Put, Patch, Delete, Param, Body, UseGuards, Query, Logger } from "@nestjs/common";
import { HospitalService } from "./hospital.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { UserRole } from "@prisma/client";
import {
  CreateHospitalDto,
  UpdateHospitalDto,
  UpdateHospitalCapacityDto,
  AcceptEmergencyDto,
} from "./dto/hospital.dto";

@Controller("hospitals")
@UseGuards(JwtAuthGuard, RolesGuard)
export class HospitalController {
  private readonly logger = new Logger(HospitalController.name);

  constructor(private readonly hospitalService: HospitalService) {
    this.logger.log("HospitalController initialized");
  }

  @Post()
  @Roles(UserRole.ADMIN)
  async create(@Body() createHospitalDto: CreateHospitalDto) {
    this.logger.log("POST /hospitals called");
    const hospital = await this.hospitalService.create(createHospitalDto);
    return hospital;
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.HOSPITAL)
  findAll(@Query("search") search?: string) {
    this.logger.log(`GET /hospitals called with search: ${search}`);
    return this.hospitalService.findAll(search);
  }

  @Get(":id")
  @Roles(UserRole.ADMIN, UserRole.HOSPITAL)
  findOne(@Param("id") id: string) {
    this.logger.log(`GET /hospitals/${id} called`);
    return this.hospitalService.findOne(id);
  }

  @Put(":id")
  @Roles(UserRole.ADMIN, UserRole.HOSPITAL)
  update(@Param("id") id: string, @Body() updateHospitalDto: UpdateHospitalDto) {
    this.logger.log(`PUT /hospitals/${id} called`);
    return this.hospitalService.update(id, updateHospitalDto);
  }

  @Delete(":id")
  @Roles(UserRole.ADMIN)
  remove(@Param("id") id: string) {
    this.logger.log(`DELETE /hospitals/${id} called`);
    return this.hospitalService.remove(id);
  }

  @Put(":id/capacity")
  @Roles(UserRole.HOSPITAL)
  updateCapacity(
    @Param("id") id: string,
    @Body() updateCapacityDto: UpdateHospitalCapacityDto,
  ) {
    this.logger.log(`PUT /hospitals/${id}/capacity called`);
    return this.hospitalService.updateCapacity(id, updateCapacityDto);
  }

  @Post(":id/accept-emergency")
  @Roles(UserRole.HOSPITAL)
  async acceptEmergency(
    @Param("id") hospitalId: string,
    @Body() acceptEmergencyDto: AcceptEmergencyDto,
  ) {
    this.logger.log(`POST /hospitals/${hospitalId}/accept-emergency called`);
    return this.hospitalService.acceptEmergency(hospitalId, acceptEmergencyDto);
  }

  @Get("nearby/:latitude/:longitude")
  @Roles(UserRole.ADMIN, UserRole.HOSPITAL)
  findNearbyHospitals(
    @Param("latitude") latitude: number,
    @Param("longitude") longitude: number,
    @Query("radius") radius: number,
  ) {
    this.logger.log(
      `GET /hospitals/nearby/${latitude}/${longitude} called with radius: ${radius}`,
    );
    return this.hospitalService.findNearbyHospitals(latitude, longitude, radius);
  }

  @Put("emergency-responses/:id")
  @Roles(UserRole.HOSPITAL)
  async updateEmergencyResponseStatus(@Param("id") responseId: string) {
    this.logger.log(`PUT /hospitals/emergency-responses/${responseId} called`);
    return this.hospitalService.updateEmergencyResponseStatus(responseId);
  }

  @Post("emergency-responses/:id/notify-rescue")
  @Roles(UserRole.HOSPITAL)
  async notifyRescueTeam(@Param("id") responseId: string) {
    this.logger.log(
      `POST /hospitals/emergency-responses/${responseId}/notify-rescue called`,
    );
    return this.hospitalService.notifyRescueTeam(responseId);
  }

  @Get("emergency-responses/:id")
  @Roles(UserRole.HOSPITAL)
  async getEmergencyResponse(@Param("id") responseId: string) {
    this.logger.log(`GET /hospitals/emergency-responses/${responseId} called`);
    return this.hospitalService.getEmergencyResponse(responseId);
  }

  // เพิ่ม endpoint ใหม่: PATCH /hospitals/emergency-responses/:id/status
  @Patch("emergency-responses/:id/status")
  @Roles(UserRole.HOSPITAL)
  async updateEmergencyResponseStatusManual(
    @Param("id") responseId: string,
    @Body("status") status: string,
  ) {
    this.logger.log(
      `PATCH /hospitals/emergency-responses/${responseId}/status called with status: ${status}`,
    );
    return this.hospitalService.updateEmergencyResponseStatusManual(responseId, status);
  }
}