import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
  Query,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  // Notification controller methods will be implemented here
  @Get()
  findAll(@Query() query: any, @CurrentUser() user: any) {
    // Will get all notifications for the current user
    return { message: 'This endpoint will return all notifications for the current user' };
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    // Will get a specific notification
    return { message: `This endpoint will return notification with id ${id}` };
  }

  @Patch(':id/read')
  markAsRead(@Param('id') id: string, @CurrentUser() user: any) {
    // Will mark a notification as read
    return { message: `This endpoint will mark notification ${id} as read` };
  }

  @Post('read-all')
  markAllAsRead(@CurrentUser() user: any) {
    // Will mark all notifications as read
    return { message: 'This endpoint will mark all notifications as read' };
  }
}