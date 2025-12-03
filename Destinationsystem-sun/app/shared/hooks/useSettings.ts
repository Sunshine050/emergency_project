import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/shared/hooks/use-toast";
import { useSettingsContext } from "@/shared/contexts/SettingsContext";
import { fetchNotifications, markNotificationAsRead as apiMarkRead, markAllNotificationsAsRead as apiMarkAllRead } from "@/shared/services/notificationService";
import { notificationSettingsSchema, systemSettingsSchema, communicationSettingsSchema, profileSettingsSchema, emergencySettingsSchema, DEFAULT_NOTIFICATION_SETTINGS, DEFAULT_SYSTEM_SETTINGS, DEFAULT_COMMUNICATION_SETTINGS, DEFAULT_PROFILE_SETTINGS, DEFAULT_EMERGENCY_SETTINGS } from "@/shared/utils/settingsUtils";
import { webSocketClient } from "@lib/websocket";
import {
  NotificationSettings,
  SystemSettings,
  CommunicationSettings,
  ProfileSettings,
  EmergencySettings,
  Notification,
} from "@/shared/types";


export const useSettings = () => {
  const { 
      notificationSettings, 
      systemSettings, 
      communicationSettings, 
      profileSettings, 
      emergencySettings, 
      updateSettings, 
      isLoading: isSettingsLoading 
  } = useSettingsContext();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { toast } = useToast();

  const notificationForm = useForm<NotificationSettings>({
    resolver: zodResolver(notificationSettingsSchema),
    defaultValues: DEFAULT_NOTIFICATION_SETTINGS,
  });

  const systemForm = useForm<SystemSettings>({
    resolver: zodResolver(systemSettingsSchema),
    defaultValues: DEFAULT_SYSTEM_SETTINGS,
  });

  const communicationForm = useForm<CommunicationSettings>({
    resolver: zodResolver(communicationSettingsSchema),
    defaultValues: DEFAULT_COMMUNICATION_SETTINGS,
  });

  const profileForm = useForm<ProfileSettings>({
    resolver: zodResolver(profileSettingsSchema),
    defaultValues: DEFAULT_PROFILE_SETTINGS,
  });

  const emergencyForm = useForm<EmergencySettings>({
    resolver: zodResolver(emergencySettingsSchema),
    defaultValues: DEFAULT_EMERGENCY_SETTINGS,
  });

  const caseManagementForm = useForm({
    defaultValues: {
      autoForward: false,
      slaResponseTime: 5
    }
  });

  const dashboardForm = useForm({
    defaultValues: {
      layout: "standard",
      refreshInterval: "30"
    }
  });

  // Sync forms with context data
  useEffect(() => {
    if (!isSettingsLoading) {
      notificationForm.reset(notificationSettings);
      systemForm.reset(systemSettings);
      communicationForm.reset(communicationSettings);
      profileForm.reset(profileSettings);
      emergencyForm.reset(emergencySettings);
      
      // Sync extended settings if they exist in systemSettings or elsewhere
      if ((systemSettings as any).caseManagement) {
        caseManagementForm.reset((systemSettings as any).caseManagement);
      }
      if ((systemSettings as any).dashboard) {
        dashboardForm.reset((systemSettings as any).dashboard);
      }
    }
  }, [isSettingsLoading, notificationSettings, systemSettings, communicationSettings, profileSettings, emergencySettings, notificationForm, systemForm, communicationForm, profileForm, emergencyForm, caseManagementForm, dashboardForm]);

  const fetchNotificationsData = async () => {
    try {
      const data = await fetchNotifications();
      setNotifications(data);
      setUnreadCount(data.filter((n) => !n.isRead).length);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const markNotificationAsRead = async (id: string) => {
    try {
      await apiMarkRead(id);
      setNotifications((prev) => prev.map((notif) => (notif.id === id ? { ...notif, isRead: true } : notif)));
      setUnreadCount((prev) => Math.max(prev - 1, 0));
      toast({ title: "แจ้งเตือนถูกทำเครื่องหมายว่าอ่านแล้ว", description: "แจ้งเตือนนี้ถูกทำเครื่องหมายว่าอ่านแล้ว" });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      toast({ title: "ข้อผิดพลาด", description: "ไม่สามารถทำเครื่องหมายว่าอ่านแล้วได้", variant: "destructive" });
    }
  };

  const markAllNotificationsAsRead = async () => {
    try {
      await apiMarkAllRead();
      setNotifications((prev) => prev.map((notif) => ({ ...notif, isRead: true })));
      setUnreadCount(0);
      toast({ title: "ทำเครื่องหมายทั้งหมดว่าอ่านแล้ว", description: "แจ้งเตือนทั้งหมดถูกทำเครื่องหมายว่าอ่านแล้ว" });
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      toast({ title: "ข้อผิดพลาด", description: "ไม่สามารถทำเครื่องหมายทั้งหมดว่าอ่านแล้วได้", variant: "destructive" });
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    webSocketClient.connect(token);
    const notificationHandler = (data: Notification) => {
      console.log("Notification received:", data);
      setNotifications((prev) => [data, ...prev]);
      setUnreadCount((prev) => prev + (data.isRead ? 0 : 1));
      toast({ title: data.title, description: data.body });
    };
    webSocketClient.on("notification", notificationHandler);
    fetchNotificationsData();

    return () => {
      webSocketClient.off("notification", notificationHandler);
      webSocketClient.disconnect();
    };
  }, []);

  return {
    notificationForm,
    systemForm,
    communicationForm,
    profileForm,
    emergencyForm,
    caseManagementForm,
    dashboardForm,
    isLoading: isSettingsLoading,
    notifications,
    unreadCount,
    onSubmitNotification: (data: NotificationSettings) => updateSettings("notification", data),
    onSubmitSystem: (data: SystemSettings) => updateSettings("system", data),
    onSubmitCommunication: (data: CommunicationSettings) => updateSettings("communication", data),
    onSubmitProfile: (data: ProfileSettings) => updateSettings("profile", data),
    onSubmitEmergency: (data: EmergencySettings) => updateSettings("emergency", data),
    onSubmitCaseManagement: (data: any) => updateSettings("caseManagement", data),
    onSubmitDashboard: (data: any) => updateSettings("dashboard", data),
    markNotificationAsRead,
    markAllNotificationsAsRead,
  };
};