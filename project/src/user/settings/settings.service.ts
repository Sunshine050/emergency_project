import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SettingsService {
    constructor(private prisma: PrismaService) { }

    async getUserSettings(userId: string) {
        // Return user data with basic settings
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                phone: true,
                role: true,
                status: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        if (!user) {
            throw new Error('User not found');
        }

        return {
            ...user,
            settings: {
                notifications: true,
                darkMode: false,
                language: 'th',
            },
        };
    }

    async updateUserSettings(userId: string, updateDto: any) {
        // Update user profile data
        const updated = await this.prisma.user.update({
            where: { id: userId },
            data: {
                firstName: updateDto.firstName,
                lastName: updateDto.lastName,
                phone: updateDto.phone,
            },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                phone: true,
                role: true,
                status: true,
            },
        });

        return {
            ...updated,
            settings: updateDto.settings || {
                notifications: true,
                darkMode: false,
                language: 'th',
            },
        };
    }
}
