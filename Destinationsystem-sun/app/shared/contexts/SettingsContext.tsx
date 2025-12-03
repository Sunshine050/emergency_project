"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useTheme } from "next-themes";
import {
  NotificationSettings,
  SystemSettings,
  CommunicationSettings,
  ProfileSettings,
  EmergencySettings,
} from "@/shared/types";
import {
  DEFAULT_NOTIFICATION_SETTINGS,
  DEFAULT_SYSTEM_SETTINGS,
  DEFAULT_COMMUNICATION_SETTINGS,
  DEFAULT_PROFILE_SETTINGS,
  DEFAULT_EMERGENCY_SETTINGS,
} from "@/shared/utils/settingsUtils";
import { SettingsService } from "@lib/api-client";
import { configureApiClient } from "@/shared/utils/apiConfig";
import { useToast } from "@/shared/hooks/use-toast";

interface SettingsContextType {
  notificationSettings: NotificationSettings;
  systemSettings: SystemSettings & { theme?: string };
  communicationSettings: CommunicationSettings;
  profileSettings: ProfileSettings;
  emergencySettings: EmergencySettings;
  updateSettings: (category: string, data: any) => Promise<void>;
  isLoading: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { setTheme, theme } = useTheme();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);

  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(DEFAULT_NOTIFICATION_SETTINGS);
  const [systemSettings, setSystemSettings] = useState<SystemSettings & { theme?: string }>({ ...DEFAULT_SYSTEM_SETTINGS, theme: "system" });
  const [communicationSettings, setCommunicationSettings] = useState<CommunicationSettings>(DEFAULT_COMMUNICATION_SETTINGS);
  const [profileSettings, setProfileSettings] = useState<ProfileSettings>(DEFAULT_PROFILE_SETTINGS);
  const [emergencySettings, setEmergencySettings] = useState<EmergencySettings>(DEFAULT_EMERGENCY_SETTINGS);

  // Load settings from LocalStorage and API on mount
  useEffect(() => {
    const loadSettings = async () => {
      setIsLoading(true);
      configureApiClient(); // Ensure API client is configured
      try {
        // 1. Load from LocalStorage (Fastest)
        const storedSettings = localStorage.getItem("app_settings");
        if (storedSettings) {
          const parsed = JSON.parse(storedSettings);
          if (parsed.notificationSettings) setNotificationSettings(parsed.notificationSettings);
          if (parsed.systemSettings) {
            setSystemSettings(parsed.systemSettings);
            if (parsed.systemSettings.theme) {
               setTheme(parsed.systemSettings.theme);
            }
          }
          if (parsed.communicationSettings) setCommunicationSettings(parsed.communicationSettings);
          if (parsed.profileSettings) setProfileSettings(parsed.profileSettings);
          if (parsed.emergencySettings) setEmergencySettings(parsed.emergencySettings);
        }

        // 2. Load from API (Source of Truth) - Only if token exists
        const token = localStorage.getItem("access_token"); 
        if (token) {
             try {
                const userProfile = await SettingsService.settingsControllerGetMe();
                if (userProfile) {
                    if (userProfile.notificationSettings) setNotificationSettings(userProfile.notificationSettings);
                    if (userProfile.systemSettings) {
                        setSystemSettings(userProfile.systemSettings);
                        if (userProfile.systemSettings.theme) setTheme(userProfile.systemSettings.theme);
                    }
                    if (userProfile.communicationSettings) setCommunicationSettings(userProfile.communicationSettings);
                    if (userProfile.emergencySettings) setEmergencySettings(userProfile.emergencySettings);
                    
                    setProfileSettings({
                        firstName: userProfile.firstName || "",
                        lastName: userProfile.lastName || "",
                        phone: userProfile.phone || "",
                    });
                }
             } catch (e) {
                 console.error("Failed to fetch user settings from API", e);
             }
        }
      } catch (error) {
        console.error("Error loading settings:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, [setTheme]);

  const updateSettings = async (category: string, data: any) => {
    try {
        configureApiClient(); // Ensure API client is configured
        // Optimistic Update
        let newSettings: any = {};
        switch (category) {
            case "notification":
                setNotificationSettings(data);
                newSettings = { notificationSettings: data };
                break;
            case "system":
                setSystemSettings((prev) => ({ ...prev, ...data }));
                if (data.theme) setTheme(data.theme);
                newSettings = { systemSettings: { ...systemSettings, ...data } };
                break;
            case "communication":
                setCommunicationSettings(data);
                newSettings = { communicationSettings: data };
                break;
            case "profile":
                setProfileSettings(data);
                newSettings = { profileSettings: data };
                break;
            case "emergency":
                setEmergencySettings(data);
                newSettings = { emergencySettings: data };
                break;
            case "caseManagement":
                // Handle case management settings (stored in systemSettings or separate field if backend supported)
                // For now, we'll store it in systemSettings.caseManagement
                const updatedSystemSettings = {
                    ...systemSettings,
                    caseManagement: data
                };
                setSystemSettings(updatedSystemSettings);
                newSettings = { systemSettings: updatedSystemSettings };
                break;
            case "dashboard":
                 // Handle dashboard settings
                 const updatedDashboardSettings = {
                    ...systemSettings,
                    dashboard: data
                 };
                 setSystemSettings(updatedDashboardSettings);
                 newSettings = { systemSettings: updatedDashboardSettings };
                 break;
        }

        // Save to LocalStorage
        const currentStored = localStorage.getItem("app_settings") ? JSON.parse(localStorage.getItem("app_settings")!) : {};
        const updatedStored = {
            ...currentStored,
            ...newSettings
        };
        localStorage.setItem("app_settings", JSON.stringify(updatedStored));

        // Save to API
        const token = localStorage.getItem("access_token");
        if (token) {
            if (category === 'profile') {
                 // For profile, we might need to map fields if the API expects a specific DTO structure
                 // But SettingsService.settingsControllerPutMe accepts UpdateSettingsDto which has profileSettings
                 await SettingsService.settingsControllerPutMe({ profileSettings: data });
            } else if (category === 'caseManagement' || category === 'dashboard') {
                 // These are part of systemSettings in frontend state but might not be supported by backend DTO yet
                 // We need to send the updated systemSettings object EXCLUDING client-only fields if backend is strict
                 const { caseManagement, dashboard, ...cleanSystemSettings } = newSettings.systemSettings || {};
                 
                 // Only send if there are actual system settings to update
                 if (Object.keys(cleanSystemSettings).length > 0) {
                    await SettingsService.settingsControllerPutMe({ systemSettings: cleanSystemSettings });
                 }
            } else {
                 const backendField = category === 'emergency' ? 'emergencySettings' : `${category}Settings`;
                 
                 // If updating system settings directly, also clean it
                 if (category === 'system') {
                    const { caseManagement, dashboard, ...cleanData } = data;
                    await SettingsService.settingsControllerPutMe({ systemSettings: cleanData });
                 } else {
                    await SettingsService.settingsControllerPutMe({ [backendField]: data });
                 }
            }
        }
        
        toast({ title: "บันทึกสำเร็จ", description: "การตั้งค่าถูกบันทึกเรียบร้อยแล้ว" });

    } catch (error) {
        console.error("Error saving settings:", error);
        toast({ title: "ข้อผิดพลาด", description: "ไม่สามารถบันทึกการตั้งค่าได้", variant: "destructive" });
    }
  };

  return (
    <SettingsContext.Provider
      value={{
        notificationSettings,
        systemSettings,
        communicationSettings,
        profileSettings,
        emergencySettings,
        updateSettings,
        isLoading,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettingsContext = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettingsContext must be used within a SettingsProvider");
  }
  return context;
};
