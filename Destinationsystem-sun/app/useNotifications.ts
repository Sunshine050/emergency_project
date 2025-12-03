// src/app/useNotifications.ts
import { useState, useEffect } from 'react';
import { getAuthHeaders } from '@lib/utils'; // Assume คุณมี getAuthHeaders จาก utils
import { Notification } from '@/shared/types';

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    async function fetchNotifications() {
      try {
        // เปลี่ยน URL เป็น backend API (port 3001) และเพิ่ม headers สำหรับ auth
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications`, {
          headers: getAuthHeaders(),
        });
        if (!res.ok) {
          const errorText = await res.text();
          console.error('Error fetching notifications:', errorText);
          throw new Error(`Failed to fetch notifications: ${res.statusText}. Details: ${errorText}`);
        }
        const data: Notification[] = await res.json();
        setNotifications(data);
        setUnreadCount(data.filter(n => !n.isRead).length);
      } catch (error) {
        console.error('Unexpected error in fetchNotifications:', error);
      }
    }
    fetchNotifications();
  }, []);

  function markAsRead(id: string) {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    setUnreadCount((count) => Math.max(0, count - 1));
  }

  function markAllAsRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  }

  return { notifications, unreadCount, markAsRead, markAllAsRead };
}