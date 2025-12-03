import { Injectable, NotFoundException, Logger } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { NotificationGateway } from "./notification.gateway";
import { CreateNotificationDto } from "./dto/notification.dto";

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    private prisma: PrismaService,
    private readonly notificationGateway: NotificationGateway,
  ) {}

  async createNotification(createNotificationDto: CreateNotificationDto) {
    this.logger.log(`Creating notification for user ${createNotificationDto.userId}`);

    // ตรวจสอบว่า userId มีอยู่ใน database
    const user = await this.prisma.user.findUnique({
      where: { id: createNotificationDto.userId },
    });

    if (!user) {
      this.logger.warn(`User ${createNotificationDto.userId} not found`);
      throw new NotFoundException(`User with ID ${createNotificationDto.userId} not found`);
    }

    try {
      const notification = await this.prisma.notification.create({
        data: {
          type: createNotificationDto.type,
          title: createNotificationDto.title,
          body: createNotificationDto.body,
          userId: createNotificationDto.userId,
          metadata: createNotificationDto.metadata,
        },
      });

      this.logger.log(`Notification ${notification.id} created for user ${createNotificationDto.userId}`);

      this.notificationGateway.sendToUser(
        createNotificationDto.userId,
        "notification",
        notification,
      );

      return notification;
    } catch (error) {
      this.logger.error(`Failed to create notification: ${error.message}`, error.stack);
      throw new Error(`Cannot create notification: ${error.message}`);
    }
  }

  async markAsRead(id: string, userId: string) {
    this.logger.log(`Marking notification ${id} as read for user ${userId}`);

    const notification = await this.prisma.notification.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!notification) {
      this.logger.warn(`Notification ${id} not found for user ${userId}`);
      throw new NotFoundException(`Notification with ID ${id} not found for user ${userId}`);
    }

    const updatedNotification = await this.prisma.notification.update({
      where: {
        id,
      },
      data: {
        isRead: true,
      },
    });

    this.logger.log(`Notification ${id} marked as read`);
    return updatedNotification;
  }

  async markAllAsRead(userId: string) {
    this.logger.log(`Marking all notifications as read for user ${userId}`);

    const notifications = await this.prisma.notification.findMany({
      where: {
        userId,
        isRead: false,
      },
    });

    if (notifications.length === 0) {
      this.logger.log(`No unread notifications for user ${userId}`);
      return { message: 'No unread notifications to mark as read' };
    }

    const result = await this.prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    this.logger.log(`Marked ${result.count} notifications as read for user ${userId}`);
    return result;
  }

  async findAll(userId: string) {
    this.logger.log(`Fetching notifications for user ${userId}`);

    const notifications = await this.prisma.notification.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    this.logger.log(`Found ${notifications.length} notifications for user ${userId}`);
    return notifications;
  }

  async deleteNotification(id: string, userId: string) {
    this.logger.log(`Deleting notification ${id} for user ${userId}`);

    const notification = await this.prisma.notification.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!notification) {
      this.logger.warn(`Notification ${id} not found for user ${userId}`);
      throw new NotFoundException(`Notification with ID ${id} not found for user ${userId}`);
    }

    const deletedNotification = await this.prisma.notification.delete({
      where: {
        id,
      },
    });

    this.logger.log(`Notification ${id} deleted`);
    return deletedNotification;
  }

  // เพิ่ม method สาธารณะเพื่อเรียก broadcastHospitalCreated
  async broadcastHospitalCreated(data: { id: string; name: string }) {
    this.logger.log(`Broadcasting hospital-created event via NotificationService: ${JSON.stringify(data)}`);
    this.notificationGateway.broadcastHospitalCreated(data);
  }
}