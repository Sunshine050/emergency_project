import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from "@nestjs/common";
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
  constructor(private readonly hospitalService: HospitalService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  create(@Body() createHospitalDto: CreateHospitalDto) {
    return this.hospitalService.create(createHospitalDto);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.EMERGENCY_CENTER, UserRole.HOSPITAL)
  findAll(@Query("search") search?: string) {
    return this.hospitalService.findAll(search);
  }

  @Get(":id")
  @Roles(UserRole.ADMIN, UserRole.EMERGENCY_CENTER, UserRole.HOSPITAL)
  findOne(@Param("id") id: string) {
    return this.hospitalService.findOne(id);
  }

  @Put(":id")
  @Roles(UserRole.ADMIN, UserRole.HOSPITAL)
  update(
    @Param("id") id: string,
    @Body() updateHospitalDto: UpdateHospitalDto,
  ) {
    return this.hospitalService.update(id, updateHospitalDto);
  }

  @Delete(":id")
  @Roles(UserRole.ADMIN)
  remove(@Param("id") id: string) {
    return this.hospitalService.remove(id);
  }

  @Put(":id/capacity")
  @Roles(UserRole.HOSPITAL)
  updateCapacity(
    @Param("id") id: string,
    @Body() updateCapacityDto: UpdateHospitalCapacityDto,
  ) {
    return this.hospitalService.updateCapacity(id, updateCapacityDto);
  }

  @Post(":id/accept-emergency")
  @Roles(UserRole.HOSPITAL)
  acceptEmergency(
    @Param("id") hospitalId: string,
    @Body() acceptEmergencyDto: AcceptEmergencyDto,
  ) {
    return this.hospitalService.acceptEmergency(hospitalId, acceptEmergencyDto);
  }

  @Get("nearby")
  findNearbyHospitals(
    @Query("latitude") latitude: number,
    @Query("longitude") longitude: number,
    @Query("radius") radius: number = 10, // Default 10km radius
  ) {
    return this.hospitalService.findNearbyHospitals(
      latitude,
      longitude,
      radius,
    );
  }
}
