import { Module } from "@nestjs/common";
import { HospitalService } from "./hospital.service";
import { PrismaModule } from "../prisma/prisma.module";
import { NotificationModule } from "../notification/notification.module";
import { HospitalController } from "./hospital.controller";

@Module({
  imports: [
    PrismaModule,
    NotificationModule,
  ],
  controllers: [HospitalController], // ย้ายมาที่นี่
  providers: [HospitalService],
  exports: [HospitalService],
})
export class HospitalModule {}