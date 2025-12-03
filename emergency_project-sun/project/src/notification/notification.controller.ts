import { Controller, Get, Put, Delete, Param, UseGuards, Logger } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiParam } from '@nestjs/swagger';
import { NotificationService } from "./notification.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";

@ApiTags('Notifications')
@ApiBearerAuth()
@Controller("notifications")
@UseGuards(JwtAuthGuard)
export class NotificationController {
  private readonly logger = new Logger(NotificationController.name);

  constructor(private readonly notificationService: NotificationService) {
    this.logger.log('NotificationController initialized');
  }

  @Get()
  @ApiOperation({ summary: 'Get all notifications', description: 'Get all notifications for authenticated user' })
  @ApiResponse({ status: 200, description: 'Notifications retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(@CurrentUser() user: any) {
    this.logger.log(`Fetching notifications for userId: ${user.id}`);
    try {
      const notifications = await this.notificationService.findAll(user.id);
      this.logger.log(`Found ${notifications.length} notifications for userId: ${user.id}`);
      return notifications;
    } catch (error) {
      this.logger.error(`Error fetching notifications for userId ${user.id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Put(":id/read")
  @ApiOperation({ summary: 'Mark notification as read', description: 'Mark a specific notification as read' })
  @ApiParam({ name: 'id', description: 'Notification ID' })
  @ApiResponse({ status: 200, description: 'Notification marked as read successfully' })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  async markAsRead(@Param("id") id: string, @CurrentUser() user: any) {
    this.logger.log(`Marking notification as read: { id: ${id}, userId: ${user.id} }`);
    try {
      const result = await this.notificationService.markAsRead(id, user.id);
      this.logger.log(`Successfully marked notification ${id} as read for userId: ${user.id}`);
      return result;
    } catch (error) {
      this.logger.error(`Error marking notification ${id} as read for userId ${user.id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Put("read-all")
  @ApiOperation({ summary: 'Mark all notifications as read', description: 'Mark all notifications as read for authenticated user' })
  @ApiResponse({ status: 200, description: 'All notifications marked as read successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async markAllAsRead(@CurrentUser() user: any) {
    this.logger.log(`Marking all notifications as read for userId: ${user.id}`);
    try {
      const result = await this.notificationService.markAllAsRead(user.id);
      this.logger.log(`Successfully marked all notifications as read for userId: ${user.id}. Result: ${JSON.stringify(result)}`);
      return result;
    } catch (error) {
      this.logger.error(`Error marking all notifications as read for userId ${user.id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Delete(":id")
  @ApiOperation({ summary: 'Delete notification', description: 'Delete a specific notification' })
  @ApiParam({ name: 'id', description: 'Notification ID' })
  @ApiResponse({ status: 200, description: 'Notification deleted successfully' })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  async deleteNotification(@Param("id") id: string, @CurrentUser() user: any) {
    this.logger.log(`Deleting notification: { id: ${id}, userId: ${user.id} }`);
    try {
      const result = await this.notificationService.deleteNotification(id, user.id);
      this.logger.log(`Successfully deleted notification ${id} for userId: ${user.id}`);
      return result;
    } catch (error) {
      this.logger.error(`Error deleting notification ${id} for userId ${user.id}: ${error.message}`, error.stack);
      throw error;
    }
  }
}