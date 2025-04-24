import { Module } from '@nestjs/common';
import { RescueController } from './rescue.controller';
import { RescueService } from './rescue.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [RescueController],
  providers: [RescueService],
  exports: [RescueService],
})
export class RescueModule {}