import { Controller, Get, Put, Delete, Param, UseGuards, Logger } from "@nestjs/common";
import { NotificationService } from "./notification.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";

@Controller("notifications")
@UseGuards(JwtAuthGuard)
export class NotificationController {
  private readonly logger = new Logger(NotificationController.name);

  constructor(private readonly notificationService: NotificationService) {
    this.logger.log('NotificationController initialized');
  }

  @Get()
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