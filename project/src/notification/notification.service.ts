import { Injectable } from "@nestjs/common";
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

    // Send real-time notification via WebSocket
    this.notificationGateway.sendToUser(
      createNotificationDto.userId,
      "notification",
      notification,
    );

    return notification;
  }

  async markAsRead(id: string, userId: string) {
    return this.prisma.notification.update({
      where: {
        id,
        userId,
      },
      data: {
        isRead: true,
      },
    });
  }

  async markAllAsRead(userId: string) {
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
    return this.prisma.notification.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }
}
