// app/shared/hooks/useNotifications.ts
"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/shared/hooks/use-toast";
import { fetchNotifications, markAsRead, markAllAsRead } from "../services/notificationService";
import { Notification } from "../types";

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { toast } = useToast();

  const loadNotifications = async () => {
    try {
      const data = await fetchNotifications();
      setNotifications(data);
      setUnreadCount(data.filter((n) => !n.isRead).length);
    } catch (error) {
      toast({ title: "ข้อผิดพลาด", description: "ไม่สามารถดึงข้อมูลการแจ้งเตือนได้", variant: "destructive" });
    }
  };

  const onMarkAsRead = async (id: string) => {
    try {
      await markAsRead(id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
      setUnreadCount((prev) => Math.max(prev - 1, 0));
    } catch (error) {
      toast({ title: "ข้อผิดพลาด", description: "ไม่สามารถทำการแจ้งเตือน", variant: "destructive" });
    }
  };

  const onMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      toast({ title: "ข้อผิดพลาด", description: "ไม่สามารถทำการแจ้งเตือนทั้งหมด", variant: "destructive" });
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  return { notifications, unreadCount, onMarkAsRead, onMarkAllAsRead };
};