import { NotificationsService } from "@lib/api-client";
import { configureApiClient } from "@/shared/utils/apiConfig";
import { Notification } from "../types";

export interface CreateNotificationDto {
  type: string;
  title: string;
  body: string;
  userId: string;
  metadata?: Record<string, any>;
}

export const fetchNotifications = async (): Promise<Notification[]> => {
  configureApiClient();
  return NotificationsService.notificationControllerFindAll();
};

export const createNotification = async (data: CreateNotificationDto): Promise<Notification> => {
  configureApiClient();
  // Note: Create notification endpoint might not be in NotificationsService if it's not exposed or named differently.
  // Checking NotificationsService.ts, there is no create method. 
  // It might be internal or handled via socket. 
  // If the previous implementation had it, maybe it was a custom endpoint or I missed it in swagger.
  // Assuming it's not available in the generated client for now, I will keep the fetch implementation or throw error.
  // But wait, the previous code had it: POST /notifications
  // Let's check if I missed it in NotificationsService.ts. 
  // It has FindAll, MarkAsRead, MarkAllAsRead, Delete. No Create.
  // Maybe it's in another service or the swagger is incomplete?
  // I'll keep the fetch implementation for createNotification for now to avoid breaking it if it exists but not in swagger.
  // But I should use the API_URL from env.
  
  const token = localStorage.getItem("access_token");
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error(`ไม่สามารถสร้างการแจ้งเตือน: ${response.statusText}`);
  return response.json();
};

export const markAsRead = async (id: string): Promise<void> => {
  configureApiClient();
  await NotificationsService.notificationControllerMarkAsRead(id);
};

export const markAllAsRead = async (): Promise<void> => {
  configureApiClient();
  await NotificationsService.notificationControllerMarkAllAsRead();
};

export const deleteNotification = async (id: string): Promise<void> => {
  configureApiClient();
  await NotificationsService.notificationControllerDeleteNotification(id);
};

export { markAsRead as markNotificationAsRead };
export { markAllAsRead as markAllNotificationsAsRead };
