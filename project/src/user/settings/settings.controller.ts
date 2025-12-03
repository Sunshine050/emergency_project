import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';

@Controller('settings')
@UseGuards(JwtAuthGuard)
export class SettingsController {
    constructor(private readonly settingsService: SettingsService) { }

    @Get('me')
    getMe(@CurrentUser() user: any) {
        return this.settingsService.getUserSettings(user.id);
    }

    @Put('me')
    updateMe(@CurrentUser() user: any, @Body() updateDto: any) {
        return this.settingsService.updateUserSettings(user.id, updateDto);
    }
}
