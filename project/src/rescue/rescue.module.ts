import { Module } from '@nestjs/common';
import { RescueController } from './rescue.controller';
import { RescueService } from './rescue.service';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [
    PrismaModule,
    NotificationModule, // เพิ่มเพื่อให้ RescueService ใช้ NotificationService ได้
  ],
  controllers: [RescueController],
  providers: [RescueService],
  exports: [RescueService],
})
export class RescueModule {}