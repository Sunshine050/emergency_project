import { Module } from '@nestjs/common';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { NotificationGateway } from './notification.gateway';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
  ],
  controllers: [NotificationController],
  providers: [NotificationService, NotificationGateway, JwtService],
  exports: [NotificationService, NotificationGateway],
})
export class NotificationModule {}