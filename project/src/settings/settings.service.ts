import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  // Default settings values
  private getDefaultSettings() {
    return {
      notificationSettings: {
        emergencyAlerts: true,
        statusUpdates: true,
        systemNotifications: true,
        soundEnabled: true,
        emailNotifications: false,
        smsNotifications: false,
      },
      systemSettings: {
        language: 'th',
        timeZone: 'Asia/Bangkok',
        dateFormat: 'DD/MM/YYYY',
        mapProvider: 'google',
        autoRefreshInterval: '30s',
        theme: 'system',
        caseManagement: {
          autoForward: true,
          slaResponseTime: 15,
        },
        dashboard: {
          layout: 'grid',
          refreshInterval: 30,
        },
      },
      communicationSettings: {
        preferredChannel: 'app',
        autoReply: false,
      },
      profileSettings: {
        displayName: '',
        avatar: '',
        bio: '',
      },
      emergencySettings: {
        quickResponseEnabled: true,
        autoLocationShare: true,
      },
    };
  }

  // Get all settings for a user with default fallback
  async getUserSettings(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        notificationSettings: true,
        systemSettings: true,
        communicationSettings: true,
        profileSettings: true,
        emergencySettings: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const defaults = this.getDefaultSettings();

    // Merge with defaults to handle null values
    return {
      notificationSettings: {
        ...defaults.notificationSettings,
        ...((user.notificationSettings as Record<string, any>) || {}),
      },
      systemSettings: {
        ...defaults.systemSettings,
        ...((user.systemSettings as Record<string, any>) || {}),
        caseManagement: {
          ...defaults.systemSettings.caseManagement,
          ...((user.systemSettings as any)?.caseManagement || {}),
        },
        dashboard: {
          ...defaults.systemSettings.dashboard,
          ...((user.systemSettings as any)?.dashboard || {}),
        },
      },
      communicationSettings: {
        ...defaults.communicationSettings,
        ...((user.communicationSettings as Record<string, any>) || {}),
      },
      profileSettings: {
        ...defaults.profileSettings,
        ...((user.profileSettings as Record<string, any>) || {}),
      },
      emergencySettings: {
        ...defaults.emergencySettings,
        ...((user.emergencySettings as Record<string, any>) || {}),
      },
    };
  }

  // Update (full or partial) settings – merge with existing JSON
  async updateUserSettings(userId: string, dto: UpdateSettingsDto) {
    const existing = await this.prisma.user.findUnique({ where: { id: userId } });
    const defaults = this.getDefaultSettings();

    const data: any = {};

    if (dto.notificationSettings) {
      data.notificationSettings = {
        ...defaults.notificationSettings,
        ...((existing?.notificationSettings as Record<string, any>) ?? {}),
        ...dto.notificationSettings,
      };
    }

    if (dto.systemSettings) {
      const existingSystem = (existing?.systemSettings as any) ?? {};
      data.systemSettings = {
        ...defaults.systemSettings,
        ...existingSystem,
        ...dto.systemSettings,
        caseManagement: {
          ...defaults.systemSettings.caseManagement,
          ...(existingSystem.caseManagement || {}),
          ...(dto.systemSettings.caseManagement || {}),
        },
        dashboard: {
          ...defaults.systemSettings.dashboard,
          ...(existingSystem.dashboard || {}),
          ...(dto.systemSettings.dashboard || {}),
        },
      };
    }

    if (dto.communicationSettings) {
      data.communicationSettings = {
        ...defaults.communicationSettings,
        ...((existing?.communicationSettings as Record<string, any>) ?? {}),
        ...dto.communicationSettings,
      };
    }

    if (dto.profileSettings) {
      data.profileSettings = {
        ...defaults.profileSettings,
        ...((existing?.profileSettings as Record<string, any>) ?? {}),
        ...dto.profileSettings,
      };
    }

    if (dto.emergencySettings) {
      data.emergencySettings = {
        ...defaults.emergencySettings,
        ...((existing?.emergencySettings as Record<string, any>) ?? {}),
        ...dto.emergencySettings,
      };
    }

    return this.prisma.user.update({
      where: { id: userId },
      data,
    });
  }

  // Update a single category (PATCH /me/:category)
  async updateCategory(userId: string, category: string, payload: Record<string, any>) {
    const field = `${category}Settings`; // e.g. systemSettings
    const existing = await this.prisma.user.findUnique({ where: { id: userId } });
    const defaults = this.getDefaultSettings();
    const defaultForCategory = defaults[field] || {};

    let merged = {
      ...defaultForCategory,
      ...((existing?.[field] as Record<string, any>) ?? {}),
      ...payload,
    };

    // Special handling for systemSettings nested objects
    if (category === 'system') {
      const existingSystem = (existing?.[field] as any) ?? {};
      merged = {
        ...defaultForCategory,
        ...existingSystem,
        ...payload,
        caseManagement: {
          ...(defaultForCategory as any).caseManagement,
          ...(existingSystem.caseManagement || {}),
          ...(payload.caseManagement || {}),
        },
        dashboard: {
          ...(defaultForCategory as any).dashboard,
          ...(existingSystem.dashboard || {}),
          ...(payload.dashboard || {}),
        },
      };
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: { [field]: merged as any },
    });
  }

  // Reset all settings to default
  async resetToDefault(userId: string) {
    const defaults = this.getDefaultSettings();
    return this.prisma.user.update({
      where: { id: userId },
      data: defaults as any,
    });
  }

  // Initialize default settings for new user
  async initializeDefaultSettings(userId: string) {
    const defaults = this.getDefaultSettings();
    return this.prisma.user.update({
      where: { id: userId },
      data: defaults as any,
    });
  }
}
