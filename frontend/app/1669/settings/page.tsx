"use client";

import { FormProvider } from "react-hook-form";
import { useSettings } from "@/shared/hooks/useSettings";
import { useAuth } from "@/shared/hooks/useAuth";
import DashboardLayout from "@components/dashboard/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@components/ui/card";
import { SettingsForm } from "./components/SettingsForm";

import { User, Bell, Shield, Radio, AlertTriangle, LayoutDashboard, Briefcase, Users } from "lucide-react";
import { Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@components/ui/tabs";

export default function EmergencyCenterSettings() {
  useAuth();

  const {
    notificationForm,
    systemForm,
    communicationForm,
    profileForm,
    emergencyForm,
    caseManagementForm,
    dashboardForm,
    isLoading,
    notifications,
    unreadCount,
    onSubmitNotification,
    onSubmitSystem,
    onSubmitCommunication,
    onSubmitProfile,
    onSubmitEmergency,
    onSubmitCaseManagement,
    onSubmitDashboard,
    markNotificationAsRead,
    markAllNotificationsAsRead,
  } = useSettings();

  if (isLoading) {
    return (
      <DashboardLayout
        role="emergency-center"
        notifications={notifications}
        unreadCount={unreadCount}
        onMarkAsRead={markNotificationAsRead}
        onMarkAllAsRead={markAllNotificationsAsRead}
      >
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="h-8 w-8 animate-spin mr-2" />
          กำลังโหลดการตั้งค่า...
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      role="emergency-center"
      notifications={notifications}
      unreadCount={unreadCount}
      onMarkAsRead={markNotificationAsRead}
      onMarkAllAsRead={markAllNotificationsAsRead}
    >
      <div className="container mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">ตั้งค่าศูนย์สั่งการ 1669</h1>
          <p className="text-slate-500 dark:text-slate-400">
            จัดการการตั้งค่าระบบ การจัดการเคส และบุคลากร
          </p>
        </div>

        <Tabs defaultValue="operations" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto">
            <TabsTrigger value="operations" className="py-2">
              <Briefcase className="h-4 w-4 mr-2" />
              การปฏิบัติการ
            </TabsTrigger>
            <TabsTrigger value="dashboard" className="py-2">
              <LayoutDashboard className="h-4 w-4 mr-2" />
              แดชบอร์ด
            </TabsTrigger>
            {/* Staff Tab Trigger Removed */}
            <TabsTrigger value="notifications" className="py-2">
              <Bell className="h-4 w-4 mr-2" />
              การแจ้งเตือน
            </TabsTrigger>
            <TabsTrigger value="general" className="py-2">
              <User className="h-4 w-4 mr-2" />
              ทั่วไป
            </TabsTrigger>
          </TabsList>

          {/* Operations Tab */}
          <TabsContent value="operations" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  การจัดการเคส (Case Management)
                </CardTitle>
                <CardDescription>กำหนดเกณฑ์ความรุนแรงและ SLA</CardDescription>
              </CardHeader>
              <CardContent>
                <FormProvider {...caseManagementForm}>
                  <SettingsForm
                    category="caseManagement"
                    onSubmit={(data) => onSubmitCaseManagement(data)}
                  />
                </FormProvider>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  การตั้งค่าฉุกเฉิน (Emergency Settings)
                </CardTitle>
                <CardDescription>กำหนดค่ารัศมีและระดับความเร่งด่วน</CardDescription>
              </CardHeader>
              <CardContent>
                <FormProvider {...emergencyForm}>
                  <SettingsForm
                    category="emergency"
                    onSubmit={(data) => onSubmitEmergency(data)}
                  />
                </FormProvider>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Radio className="h-5 w-5" />
                  การสื่อสาร (Communication)
                </CardTitle>
                <CardDescription>ช่องทางการติดต่อสื่อสารหลัก</CardDescription>
              </CardHeader>
              <CardContent>
                <FormProvider {...communicationForm}>
                  <SettingsForm
                    category="communication"
                    onSubmit={(data) => onSubmitCommunication(data)}
                  />
                </FormProvider>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LayoutDashboard className="h-5 w-5" />
                  ตั้งค่าแดชบอร์ด (Dashboard Settings)
                </CardTitle>
                <CardDescription>ปรับแต่งการแสดงผลและข้อมูลบนหน้าจอหลัก</CardDescription>
              </CardHeader>
              <CardContent>
                <FormProvider {...dashboardForm}>
                  <SettingsForm
                    category="dashboard"
                    onSubmit={(data) => onSubmitDashboard(data)}
                  />
                </FormProvider>
              </CardContent>
            </Card>
          </TabsContent>

            {/* Staff Tab Removed */}

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  การแจ้งเตือน (Notifications)
                </CardTitle>
                <CardDescription>จัดการการรับข่าวสารและการเตือนภัย</CardDescription>
              </CardHeader>
              <CardContent>
                <FormProvider {...notificationForm}>
                  <SettingsForm
                    category="notification"
                    onSubmit={(data) => onSubmitNotification(data)}
                  />
                </FormProvider>
              </CardContent>
            </Card>
          </TabsContent>

          {/* General Tab */}
          <TabsContent value="general" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  ข้อมูลส่วนตัว (Profile)
                </CardTitle>
                <CardDescription>แก้ไขข้อมูลบัญชีผู้ใช้ของคุณ</CardDescription>
              </CardHeader>
              <CardContent>
                <FormProvider {...profileForm}>
                  <SettingsForm
                    category="profile"
                    onSubmit={(data) => onSubmitProfile(data)}
                  />
                </FormProvider>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  ตั้งค่าระบบ (System)
                </CardTitle>
                <CardDescription>ตั้งค่าภาษา ธีม และเวลา</CardDescription>
              </CardHeader>
              <CardContent>
                <FormProvider {...systemForm}>
                  <SettingsForm
                    category="system"
                    onSubmit={(data) => onSubmitSystem(data)}
                  />
                </FormProvider>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
