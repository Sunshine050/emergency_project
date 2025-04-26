import { Module } from "@nestjs/common";
import { HospitalService } from "./hospital.service";
import { PrismaModule } from "../prisma/prisma.module";
import { NotificationModule } from "../notification/notification.module";

@Module({
  imports: [
    PrismaModule,
    NotificationModule, // ต้องมีเพื่อให้ HospitalService ใช้ NotificationService ได้
  ],
  providers: [HospitalService],
  exports: [HospitalService],
})
export class HospitalModule {}
