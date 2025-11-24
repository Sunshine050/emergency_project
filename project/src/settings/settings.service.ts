import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  // Get all settings for a user
  async getUserSettings(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        notificationSettings: true,
        systemSettings: true,
        communicationSettings: true,
        profileSettings: true,
        emergencySettings: true,
      },
    });
  }

  // Update (full or partial) settings – merge with existing JSON
  async updateUserSettings(userId: string, dto: UpdateSettingsDto) {
    const existing = await this.prisma.user.findUnique({ where: { id: userId } });

    const data = {
      notificationSettings: {
        ...((existing?.notificationSettings as Record<string, any>) ?? {}),
        ...dto.notificationSettings,
      },
      systemSettings: {
        ...((existing?.systemSettings as Record<string, any>) ?? {}),
        ...dto.systemSettings,
      },
      communicationSettings: {
        ...((existing?.communicationSettings as Record<string, any>) ?? {}),
        ...dto.communicationSettings,
      },
      profileSettings: {
        ...((existing?.profileSettings as Record<string, any>) ?? {}),
        ...dto.profileSettings,
      },
      emergencySettings: {
        ...((existing?.emergencySettings as Record<string, any>) ?? {}),
        ...dto.emergencySettings,
      },
    };

    return this.prisma.user.update({
      where: { id: userId },
      data,
    });
  }

  // Update a single category (PATCH /me/:category)
  async updateCategory(userId: string, category: string, payload: Record<string, any>) {
    const field = `${category}Settings`; // e.g. systemSettings
    const existing = await this.prisma.user.findUnique({ where: { id: userId } });
    const merged = { ...((existing?.[field] as Record<string, any>) ?? {}), ...payload };
    return this.prisma.user.update({
      where: { id: userId },
      data: { [field]: merged },
    });
  }
}
