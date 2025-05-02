import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { NotificationGateway } from "./notification.gateway";
import { CreateNotificationDto } from "./dto/notification.dto";

@Injectable()
export class NotificationService {
  constructor(
    private prisma: PrismaService,
    private notificationGateway: NotificationGateway,
  ) {}

  async createNotification(createNotificationDto: CreateNotificationDto) {
    const notification = await this.prisma.notification.create({
      data: {
        type: createNotificationDto.type,
        title: createNotificationDto.title,
        body: createNotificationDto.body,
        userId: createNotificationDto.userId,
        metadata: createNotificationDto.metadata,
      },
    });

    this.notificationGateway.sendToUser(
      createNotificationDto.userId,
      "notification",
      notification,
    );

    return notification;
  }

  async markAsRead(id: string, userId: string) {
    const notification = await this.prisma.notification.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!notification) {
      throw new NotFoundException(`Notification with ID ${id} not found for user ${userId}`);
    }

    return this.prisma.notification.update({
      where: {
        id,
      },
      data: {
        isRead: true,
      },
    });
  }

  async markAllAsRead(userId: string) {
    const notifications = await this.prisma.notification.findMany({
      where: {
        userId,
        isRead: false,
      },
    });

    if (notifications.length === 0) {
      return { message: 'No unread notifications to mark as read' };
    }

    return this.prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });
  }

  async findAll(userId: string) {
    console.log('[NotificationService] Fetching notifications for userId:', userId);
    const notifications = await this.prisma.notification.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    console.log('[NotificationService] Found notifications:', notifications);
    return notifications;
  }

  async deleteNotification(id: string, userId: string) {
    const notification = await this.prisma.notification.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!notification) {
      throw new NotFoundException(`Notification with ID ${id} not found for user ${userId}`);
    }

    return this.prisma.notification.delete({
      where: {
        id,
      },
    });
  }
}