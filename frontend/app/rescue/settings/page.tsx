"use client";

import { useState } from "react";
import { useSettings } from "@/shared/hooks/useSettings";
import { useOrganizationSettings } from "@/shared/hooks/useOrganizationSettings";
import { useAuth } from "@/shared/hooks/useAuth";
import DashboardLayout from "@components/dashboard/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@components/ui/tabs";
import { FormProvider } from "react-hook-form";
import { SettingsForm } from "@/1669/settings/components/SettingsForm";
import { Loader2, Ambulance, Activity, User, Bell } from "lucide-react";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@components/ui/select";

export default function RescueSettingsPage() {
  useAuth();
  const {
    notificationForm,
    profileForm,
    isLoading: isSettingsLoading,
    notifications,
    unreadCount,
    onSubmitNotification,
    onSubmitProfile,
    markNotificationAsRead,
    markAllNotificationsAsRead,
  } = useSettings();

  const {
    organization: team,
    isLoading: isOrgLoading,
    updateOrganization,
    updateStatus,
  } = useOrganizationSettings("rescue_team");

  const [activeTab, setActiveTab] = useState("team-info");

  // Local state
  const [teamName, setTeamName] = useState(team?.name || "");
  const [baseLocation, setBaseLocation] = useState(team?.baseLocation || "");
  const [vehicleType, setVehicleType] = useState(team?.vehicleType || "");
  const [status, setStatus] = useState(team?.status || "AVAILABLE");

  // Update local state when team data loads
  if (team && teamName === "" && !isOrgLoading) {
      setTeamName(team.name || "");
      setBaseLocation(team.baseLocation || "");
      setVehicleType(team.vehicleType || "");
      setStatus(team.status || "AVAILABLE");
  }

  const handleUpdateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateOrganization({
        name: teamName,
        baseLocation: baseLocation,
        vehicleType: vehicleType
    });
  };

  const handleUpdateStatus = async (value: string) => {
    setStatus(value);
    await updateStatus(value);
  };

  if (isSettingsLoading || isOrgLoading) {
    return (
      <DashboardLayout
        role="rescue"
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
      role="rescue"
      notifications={notifications}
      unreadCount={unreadCount}
      onMarkAsRead={markNotificationAsRead}
      onMarkAllAsRead={markAllNotificationsAsRead}
    >
      <div className="container mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">ตั้งค่าหน่วยกู้ภัย</h1>
          <p className="text-slate-500 dark:text-slate-400">
            จัดการข้อมูลทีม สถานะ และการตั้งค่าส่วนตัว
          </p>
        </div>

        <Tabs defaultValue="team-info" className="space-y-4" onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="team-info" className="flex items-center gap-2">
              <Ambulance className="h-4 w-4" />
              ข้อมูลทีม
            </TabsTrigger>
            <TabsTrigger value="status" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              สถานะ
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              โปรไฟล์ส่วนตัว
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              การแจ้งเตือน
            </TabsTrigger>
          </TabsList>

          <TabsContent value="team-info">
            <Card>
              <CardHeader>
                <CardTitle>ข้อมูลทีมกู้ภัย</CardTitle>
                <CardDescription>แก้ไขข้อมูลพื้นฐานของทีม</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdateTeam} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">ชื่อทีม</Label>
                    <Input id="name" value={teamName} onChange={(e) => setTeamName(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="baseLocation">สถานที่ตั้งฐาน</Label>
                    <Input id="baseLocation" value={baseLocation} onChange={(e) => setBaseLocation(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="vehicleType">ประเภทรถ</Label>
                    <Input id="vehicleType" value={vehicleType} onChange={(e) => setVehicleType(e.target.value)} />
                  </div>
                  <Button type="submit">บันทึกข้อมูล</Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="status">
            <Card>
              <CardHeader>
                <CardTitle>สถานะความพร้อม</CardTitle>
                <CardDescription>อัปเดตสถานะความพร้อมของทีม</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>สถานะปัจจุบัน</Label>
                    <Select value={status} onValueChange={handleUpdateStatus}>
                      <SelectTrigger>
                        <SelectValue placeholder="เลือกสถานะ" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="AVAILABLE">ว่าง (Available)</SelectItem>
                        <SelectItem value="BUSY">ไม่ว่าง (Busy)</SelectItem>
                        <SelectItem value="OFFLINE">ออฟไลน์ (Offline)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>โปรไฟล์ส่วนตัว</CardTitle>
                <CardDescription>แก้ไขข้อมูลส่วนตัวของคุณ</CardDescription>
              </CardHeader>
              <CardContent>
                <FormProvider {...profileForm}>
                  <SettingsForm category="profile" onSubmit={onSubmitProfile} />
                </FormProvider>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>การแจ้งเตือน</CardTitle>
                <CardDescription>ตั้งค่าการรับการแจ้งเตือน</CardDescription>
              </CardHeader>
              <CardContent>
                <FormProvider {...notificationForm}>
                  <SettingsForm category="notification" onSubmit={onSubmitNotification} />
                </FormProvider>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
