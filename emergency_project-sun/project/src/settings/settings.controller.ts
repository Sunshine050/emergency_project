import {
  Controller,
  Get,
  Put,
  Patch,
  Post,
  Param,
  Body,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { SettingsService } from './settings.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Settings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get all user settings', description: 'Retrieve all settings for the authenticated user' })
  @ApiResponse({ status: 200, description: 'User settings retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getMe(@Req() req: any) {
    const userId = req.user.id;
    return this.settingsService.getUserSettings(userId);
  }

  @Put('me')
  @ApiOperation({ summary: 'Update user settings', description: 'Update all or partial user settings (merges with existing)' })
  @ApiBody({ type: UpdateSettingsDto })
  @ApiResponse({ status: 200, description: 'Settings updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async putMe(@Req() req: any, @Body() dto: UpdateSettingsDto) {
    const userId = req.user.id;
    const updated = await this.settingsService.updateUserSettings(userId, dto);
    return { message: 'Settings updated', updatedSettings: updated };
  }

  @Patch('me/:category')
  @ApiOperation({ summary: 'Update specific settings category', description: 'Update a specific category (notification, system, communication, profile, emergency)' })
  @ApiParam({ name: 'category', description: 'Settings category (notification, system, communication, profile, emergency)', example: 'notification' })
  @ApiBody({ schema: { type: 'object', additionalProperties: true } })
  @ApiResponse({ status: 200, description: 'Category settings updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async patchCategory(
    @Req() req: any,
    @Param('category') category: string,
    @Body() payload: any,
  ) {
    const userId = req.user.id;
    const updated = await this.settingsService.updateCategory(
      userId,
      category,
      payload,
    );
    return { message: `${category} updated`, data: updated };
  }

  @Get('me/:category')
  @ApiOperation({ summary: 'Get specific settings category', description: 'Get settings for a specific category' })
  @ApiParam({ name: 'category', description: 'Settings category (notification, system, communication, profile, emergency)', example: 'notification' })
  @ApiResponse({ status: 200, description: 'Category settings retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getCategory(@Req() req: any, @Param('category') category: string) {
    const userId = req.user.id;
    const settings = await this.settingsService.getUserSettings(userId);
    const field = `${category}Settings`;
    return settings[field] || {};
  }

  @Post('reset')
  @ApiOperation({ summary: 'Reset all settings to default', description: 'Reset all user settings to their default values' })
  @ApiResponse({ status: 200, description: 'Settings reset to default successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async resetToDefault(@Req() req: any) {
    const userId = req.user.id;
    await this.settingsService.resetToDefault(userId);
    return { message: 'Settings reset to default successfully' };
  }
}
