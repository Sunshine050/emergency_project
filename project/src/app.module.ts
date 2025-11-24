import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { SosModule } from './sos/sos.module';
import { HospitalModule } from './hospital/hospital.module';
import { RescueModule } from './rescue/rescue.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { NotificationModule } from './notification/notification.module';
import { SupabaseModule } from './supabase/supabase.module';
import { SettingsModule } from './settings/settings.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    SupabaseModule,
    PrismaModule,
    AuthModule,
    UserModule,
    SosModule,
    HospitalModule,
    RescueModule,
    DashboardModule,
    NotificationModule,
    SettingsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
