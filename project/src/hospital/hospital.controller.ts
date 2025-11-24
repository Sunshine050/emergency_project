import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  Query,
  Logger,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiParam, ApiBody, ApiQuery } from '@nestjs/swagger';
import { HospitalService } from "./hospital.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { GetUser } from "../auth/decorators/get-user.decorator";
import { UserRole } from "@prisma/client";
import {
  CreateHospitalDto,
  UpdateHospitalDto,
  UpdateHospitalCapacityDto,
  AcceptEmergencyDto,
} from "./dto/hospital.dto";
import { GenerateReportDto, GetReportsQueryDto } from "../reports/dto/reports.dto";

@ApiTags('Hospitals')
@ApiBearerAuth()
@Controller("hospitals")
@UseGuards(JwtAuthGuard, RolesGuard)
export class HospitalController {
  private readonly logger = new Logger(HospitalController.name);

  constructor(private readonly hospitalService: HospitalService) {
    this.logger.log("HospitalController initialized");
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.HOSPITAL)
  @ApiOperation({ summary: 'Create hospital', description: 'Create a new hospital organization (ADMIN or HOSPITAL role)' })
  @ApiBody({ type: CreateHospitalDto })
  @ApiResponse({ status: 201, description: 'Hospital created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async create(@Body() createHospitalDto: CreateHospitalDto) {
    this.logger.log("POST /hospitals called");
    const hospital = await this.hospitalService.create(createHospitalDto);
    return hospital;
  }

  @Get()
  @Roles(
    UserRole.ADMIN,
    UserRole.HOSPITAL,
    UserRole.EMERGENCY_CENTER,
    UserRole.RESCUE_TEAM,
  )
  @ApiOperation({ summary: 'Get all hospitals', description: 'Get list of all hospitals with optional search' })
  @ApiQuery({ name: 'search', required: false, description: 'Search query for hospital name or location' })
  @ApiResponse({ status: 200, description: 'Hospitals retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAll(@Query("search") search?: string) {
    this.logger.log(`GET /hospitals called with search: ${search}`);
    return this.hospitalService.findAll(search);
  }

  @Get(":id")
  @Roles(
    UserRole.ADMIN,
    UserRole.HOSPITAL,
    UserRole.EMERGENCY_CENTER,
    UserRole.RESCUE_TEAM,
  )
  @ApiOperation({ summary: 'Get hospital by ID', description: 'Get detailed information about a specific hospital' })
  @ApiParam({ name: 'id', description: 'Hospital ID' })
  @ApiResponse({ status: 200, description: 'Hospital retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Hospital not found' })
  findOne(@Param("id") id: string) {
    this.logger.log(`GET /hospitals/${id} called`);
    return this.hospitalService.findOne(id);
  }

  @Put(":id")
  @Roles(UserRole.ADMIN, UserRole.HOSPITAL)
  @ApiOperation({ summary: 'Update hospital', description: 'Update hospital information' })
  @ApiParam({ name: 'id', description: 'Hospital ID' })
  @ApiBody({ type: UpdateHospitalDto })
  @ApiResponse({ status: 200, description: 'Hospital updated successfully' })
  @ApiResponse({ status: 404, description: 'Hospital not found' })
  update(@Param("id") id: string, @Body() updateHospitalDto: UpdateHospitalDto) {
    this.logger.log(`PUT /hospitals/${id} called`);
    return this.hospitalService.update(id, updateHospitalDto);
  }

  @Delete(":id")
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete hospital', description: 'Delete a hospital (ADMIN only)' })
  @ApiParam({ name: 'id', description: 'Hospital ID' })
  @ApiResponse({ status: 200, description: 'Hospital deleted successfully' })
  @ApiResponse({ status: 404, description: 'Hospital not found' })
  remove(@Param("id") id: string) {
    this.logger.log(`DELETE /hospitals/${id} called`);
    return this.hospitalService.remove(id);
  }

  @Put(":id/capacity")
  @Roles(UserRole.HOSPITAL)
  @ApiOperation({ summary: 'Update hospital capacity', description: 'Update bed capacity information (HOSPITAL role)' })
  @ApiParam({ name: 'id', description: 'Hospital ID' })
  @ApiBody({ type: UpdateHospitalCapacityDto })
  @ApiResponse({ status: 200, description: 'Capacity updated successfully' })
  @ApiResponse({ status: 404, description: 'Hospital not found' })
  updateCapacity(
    @Param("id") id: string,
    @Body() updateCapacityDto: UpdateHospitalCapacityDto,
  ) {
    this.logger.log(`PUT /hospitals/${id}/capacity called`);
    return this.hospitalService.updateCapacity(id, updateCapacityDto);
  }

  @Post(":id/accept-emergency")
  @Roles(UserRole.HOSPITAL)
  @ApiOperation({ summary: 'Accept emergency request', description: 'Hospital accepts an emergency request' })
  @ApiParam({ name: 'id', description: 'Hospital ID' })
  @ApiBody({ type: AcceptEmergencyDto })
  @ApiResponse({ status: 201, description: 'Emergency accepted successfully' })
  @ApiResponse({ status: 404, description: 'Hospital or emergency not found' })
  async acceptEmergency(
    @Param("id") hospitalId: string,
    @Body() acceptEmergencyDto: AcceptEmergencyDto,
  ) {
    this.logger.log(`POST /hospitals/${hospitalId}/accept-emergency called`);
    return this.hospitalService.acceptEmergency(hospitalId, acceptEmergencyDto);
  }

  @Get("nearby/:latitude/:longitude")
  @Roles(
    UserRole.ADMIN,
    UserRole.HOSPITAL,
    UserRole.EMERGENCY_CENTER,
    UserRole.RESCUE_TEAM,
  )
  @ApiOperation({ summary: 'Find nearby hospitals', description: 'Find hospitals within a specified radius from coordinates' })
  @ApiParam({ name: 'latitude', description: 'Latitude coordinate' })
  @ApiParam({ name: 'longitude', description: 'Longitude coordinate' })
  @ApiQuery({ name: 'radius', description: 'Search radius in kilometers', required: false })
  @ApiResponse({ status: 200, description: 'Nearby hospitals retrieved successfully' })
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
  @ApiOperation({ summary: 'Update emergency response status', description: 'Update status of an emergency response' })
  @ApiParam({ name: 'id', description: 'Emergency response ID' })
  @ApiResponse({ status: 200, description: 'Emergency response status updated' })
  @ApiResponse({ status: 404, description: 'Emergency response not found' })
  async updateEmergencyResponseStatus(@Param("id") responseId: string) {
    this.logger.log(`PUT /hospitals/emergency-responses/${responseId} called`);
    return this.hospitalService.updateEmergencyResponseStatus(responseId);
  }

  @Post("emergency-responses/:id/notify-rescue")
  @Roles(UserRole.HOSPITAL)
  @ApiOperation({ summary: 'Notify rescue team', description: 'Notify rescue team about an emergency response' })
  @ApiParam({ name: 'id', description: 'Emergency response ID' })
  @ApiResponse({ status: 200, description: 'Rescue team notified' })
  @ApiResponse({ status: 404, description: 'Emergency response not found' })
  async notifyRescueTeam(@Param("id") responseId: string) {
    this.logger.log(
      `POST /hospitals/emergency-responses/${responseId}/notify-rescue called`,
    );
    return this.hospitalService.notifyRescueTeam(responseId);
  }

  @Get("emergency-responses/:id")
  @Roles(UserRole.HOSPITAL)
  @ApiOperation({ summary: 'Get emergency response', description: 'Retrieve details of an emergency response' })
  @ApiParam({ name: 'id', description: 'Emergency response ID' })
  @ApiResponse({ status: 200, description: 'Emergency response retrieved' })
  @ApiResponse({ status: 404, description: 'Emergency response not found' })
  async getEmergencyResponse(@Param("id") responseId: string) {
    this.logger.log(`GET /hospitals/emergency-responses/${responseId} called`);
    return this.hospitalService.getEmergencyResponse(responseId);
  }

  // PATCH /hospitals/emergency-responses/:id/status
  @Patch("emergency-responses/:id/status")
  @Roles(UserRole.HOSPITAL)
  @ApiOperation({ summary: 'Manually update emergency response status', description: 'Patch status of an emergency response' })
  @ApiParam({ name: 'id', description: 'Emergency response ID' })
  @ApiBody({ description: 'New status', schema: { type: 'object', properties: { status: { type: 'string' } } } })
  @ApiResponse({ status: 200, description: 'Emergency response status updated' })
  @ApiResponse({ status: 404, description: 'Emergency response not found' })
  async updateEmergencyResponseStatusManual(
    @Param("id") responseId: string,
    @Body("status") status: string,
  ) {
    this.logger.log(
      `PATCH /hospitals/emergency-responses/${responseId}/status called with status: ${status}`,
    );
    return this.hospitalService.updateEmergencyResponseStatusManual(responseId, status);
  }

  // === NEW REPORTS ENDPOINTS ===

  @Get(":id/reports")
  @Roles(UserRole.HOSPITAL, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get hospital reports', description: 'Get reports for a specific hospital' })
  @ApiParam({ name: 'id', description: 'Hospital ID' })
  @ApiResponse({ status: 200, description: 'Reports retrieved successfully' })
  getReports(
    @Param("id") hospitalId: string,
    @Query() query: GetReportsQueryDto,
  ) {
    this.logger.log(`GET /hospitals/${hospitalId}/reports called`);
    return this.hospitalService.getReports(hospitalId, query);
  }

  @Get(":id/stats")
  @Roles(UserRole.HOSPITAL, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get hospital statistics', description: 'Get statistical data for a hospital' })
  @ApiParam({ name: 'id', description: 'Hospital ID' })
  @ApiQuery({ name: 'period', required: false, description: 'Time period (day, week, month, year)' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Start date (ISO format)' })
  @ApiQuery({ name: 'endDate', required: false, description: 'End date (ISO format)' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  getStats(
    @Param("id") hospitalId: string,
    @Query("period") period?: string,
    @Query("startDate") startDate?: string,
    @Query("endDate") endDate?: string,
  ) {
    this.logger.log(`GET /hospitals/${hospitalId}/stats called`);
    return this.hospitalService.getStats(hospitalId, period, startDate, endDate);
  }

  @Get(":id/metrics")
  @Roles(UserRole.HOSPITAL, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get hospital metrics', description: 'Retrieve specific metric data for a hospital' })
  @ApiParam({ name: 'id', description: 'Hospital ID' })
  @ApiQuery({ name: 'metric', description: 'Metric name' })
  @ApiQuery({ name: 'period', description: 'Time period' })
  @ApiQuery({ name: 'granularity', required: false, description: 'Granularity of data' })
  @ApiResponse({ status: 200, description: 'Metrics retrieved successfully' })
  getMetrics(
    @Param("id") hospitalId: string,
    @Query("metric") metric: string,
    @Query("period") period: string,
    @Query("granularity") granularity?: string,
  ) {
    this.logger.log(`GET /hospitals/${hospitalId}/metrics called`);
    return this.hospitalService.getMetrics(hospitalId, metric, period, granularity);
  }

  @Post(":id/reports/generate")
  @Roles(UserRole.HOSPITAL, UserRole.ADMIN)
  @ApiOperation({ summary: 'Generate hospital report', description: 'Generate a new report for the hospital' })
  @ApiParam({ name: 'id', description: 'Hospital ID' })
  @ApiBody({ type: GenerateReportDto })
  @ApiResponse({ status: 201, description: 'Report generated successfully' })
  generateReport(
    @Param("id") hospitalId: string,
    @Body() generateReportDto: GenerateReportDto,
    @GetUser("id") userId: string,
  ) {
    this.logger.log(`POST /hospitals/${hospitalId}/reports/generate called`);
    return this.hospitalService.generateReport(hospitalId, userId, generateReportDto);
  }
}
