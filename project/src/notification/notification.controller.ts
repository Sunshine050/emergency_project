import { Controller, Get, Put, Delete, Param, UseGuards } from "@nestjs/common";
import { NotificationService } from "./notification.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";

@Controller("notifications")
@UseGuards(JwtAuthGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  findAll(@CurrentUser() user: any) {
    console.log('[NotificationController] Fetching notifications for userId:', user.id);
    const notifications = this.notificationService.findAll(user.id);
    console.log('[NotificationController] Found notifications:', notifications);
    return notifications;
  }

  @Put(":id/read")
  markAsRead(@Param("id") id: string, @CurrentUser() user: any) {
    console.log('[NotificationController] Marking notification as read:', { id, userId: user.id });
    return this.notificationService.markAsRead(id, user.id);
  }

  @Put("read-all")
  markAllAsRead(@CurrentUser() user: any) {
    console.log('[NotificationController] Marking all notifications as read for userId:', user.id);
    return this.notificationService.markAllAsRead(user.id);
  }

  @Delete(":id")
  deleteNotification(@Param("id") id: string, @CurrentUser() user: any) {
    console.log('[NotificationController] Deleting notification:', { id, userId: user.id });
    return this.notificationService.deleteNotification(id, user.id);
  }
}