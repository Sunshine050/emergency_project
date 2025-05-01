import { Module } from "@nestjs/common";
import { DashboardController } from "./dashboard.controller";
import { DashboardService } from "./dashboard.service";
import { PrismaModule } from "../prisma/prisma.module";
import { SosModule } from "../sos/sos.module";
import { HospitalModule } from "../hospital/hospital.module";
import { RescueModule } from "../rescue/rescue.module";
import { EmergencyCaseDto } from "./dto/dashboard.dto";
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [PrismaModule, SosModule, HospitalModule, RescueModule, EmergencyCaseDto , NotificationModule],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
