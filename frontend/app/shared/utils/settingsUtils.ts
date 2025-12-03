// app/shared/utils/settingsUtils.ts
import * as z from "zod";

export const notificationSettingsSchema = z.object({
  emergencyAlerts: z.boolean(),
  statusUpdates: z.boolean(),
  systemNotifications: z.boolean(),
  soundEnabled: z.boolean(),
  emailNotifications: z.boolean(),
  smsNotifications: z.boolean(),
});

export const systemSettingsSchema = z.object({
  language: z.string(),
  timeZone: z.string(),
  dateFormat: z.string(),
  mapProvider: z.string(),
  autoRefreshInterval: z.string(),
  theme: z.string().optional(),
});

export const communicationSettingsSchema = z.object({
  primaryContactNumber: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format"),
  backupContactNumber: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format"),
  emergencyEmail: z.string().email("Invalid email address"),
  broadcastChannel: z.string(),
});

export const profileSettingsSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format").optional(),
});

export const emergencySettingsSchema = z.object({
  defaultRadius: z.number().min(1, "Radius must be at least 1 km").max(100, "Radius must be at most 100 km"),
  minUrgencyLevel: z.enum(["CRITICAL", "URGENT", "NON_URGENT"]),
});

// Defaults (export for hook)
export const DEFAULT_NOTIFICATION_SETTINGS = {
  emergencyAlerts: true,
  statusUpdates: true,
  systemNotifications: true,
  soundEnabled: true,
  emailNotifications: true,
  smsNotifications: true,
} as const;

export const DEFAULT_SYSTEM_SETTINGS = {
  language: "th",
  timeZone: "Asia/Bangkok",
  dateFormat: "DD/MM/YYYY",
  mapProvider: "google",
  autoRefreshInterval: "30",
  theme: "system",
} as const;

export const DEFAULT_COMMUNICATION_SETTINGS = {
  primaryContactNumber: "+6621234567",
  backupContactNumber: "+6622345678",
  emergencyEmail: "emergency@1669.th",
  broadcastChannel: "primary",
} as const;

export const DEFAULT_PROFILE_SETTINGS = {
  firstName: "",
  lastName: "",
  phone: "",
} as const;

export const DEFAULT_EMERGENCY_SETTINGS = {
  defaultRadius: 10,
  minUrgencyLevel: "URGENT",
} as const;

export const hospitalSettingsSchema = z.object({
  hospitalName: z.string(),
  address: z.string(),
  primaryContact: z.string(),
  emergencyContact: z.string(),
  totalBeds: z.string(),
  icuBeds: z.string(),
  emergencyCapacity: z.string(),
  ambulanceCount: z.string(),
});

export const DEFAULT_HOSPITAL_SETTINGS = {
  hospitalName: "Thonburi Hospital",
  address: "34/1 Itsaraphap Rd, Bangkok",
  primaryContact: "+66 2 123 4567",
  emergencyContact: "+66 2 234 5678",
  totalBeds: "120",
  icuBeds: "15",
  emergencyCapacity: "30",
  ambulanceCount: "8",
} as const;