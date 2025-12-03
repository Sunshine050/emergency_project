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
import { Loader2, Building2, BedDouble, User, Bell } from "lucide-react";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";

export default function HospitalSettingsPage() {
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
    organization: hospital,
    isLoading: isOrgLoading,
    updateOrganization,
    updateCapacity,
  } = useOrganizationSettings("hospital");

  const [activeTab, setActiveTab] = useState("hospital-info");

  // Local state for hospital forms (simplified for now, ideally use react-hook-form)
  const [hospitalName, setHospitalName] = useState(hospital?.name || "");
  const [hospitalAddress, setHospitalAddress] = useState(hospital?.address || "");
  const [hospitalPhone, setHospitalPhone] = useState(hospital?.phone || "");
  
  const [icuBeds, setIcuBeds] = useState(hospital?.icuBeds || 0);
  const [availableIcuBeds, setAvailableIcuBeds] = useState(hospital?.availableIcuBeds || 0);
  const [normalBeds, setNormalBeds] = useState(hospital?.normalBeds || 0);
  const [availableNormalBeds, setAvailableNormalBeds] = useState(hospital?.availableNormalBeds || 0);

  // Update local state when hospital data loads
  if (hospital && hospitalName === "" && !isOrgLoading) {
      setHospitalName(hospital.name || "");
      setHospitalAddress(hospital.address || "");
      setHospitalPhone(hospital.phone || "");
      setIcuBeds(hospital.icuBeds || 0);
      setAvailableIcuBeds(hospital.availableIcuBeds || 0);
      setNormalBeds(hospital.normalBeds || 0);
      setAvailableNormalBeds(hospital.availableNormalBeds || 0);
  }

  const handleUpdateHospital = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateOrganization({
        name: hospitalName,
        address: hospitalAddress,
        phone: hospitalPhone
    });
  };

  const handleUpdateCapacity = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateCapacity({
        icuBeds: Number(icuBeds),
        availableIcuBeds: Number(availableIcuBeds),
        normalBeds: Number(normalBeds),
        availableNormalBeds: Number(availableNormalBeds)
    });
  };

  if (isSettingsLoading || isOrgLoading) {
    return (
      <DashboardLayout
        role="hospital"
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
      role="hospital"
      notifications={notifications}
      unreadCount={unreadCount}
      onMarkAsRead={markNotificationAsRead}
      onMarkAllAsRead={markAllNotificationsAsRead}
    >
      <div className="container mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">ตั้งค่าโรงพยาบาล</h1>
          <p className="text-slate-500 dark:text-slate-400">
            จัดการข้อมูลโรงพยาบาล ความจุเตียง และการตั้งค่าส่วนตัว
          </p>
        </div>

        <Tabs defaultValue="hospital-info" className="space-y-4" onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="hospital-info" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              ข้อมูลทั่วไป
            </TabsTrigger>
            <TabsTrigger value="capacity" className="flex items-center gap-2">
              <BedDouble className="h-4 w-4" />
              ความจุเตียง
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

          <TabsContent value="hospital-info">
            <Card>
              <CardHeader>
                <CardTitle>ข้อมูลโรงพยาบาล</CardTitle>
                <CardDescription>แก้ไขข้อมูลพื้นฐานของโรงพยาบาล</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdateHospital} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">ชื่อโรงพยาบาล</Label>
                    <Input id="name" value={hospitalName} onChange={(e) => setHospitalName(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">ที่อยู่</Label>
                    <Input id="address" value={hospitalAddress} onChange={(e) => setHospitalAddress(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">เบอร์โทรศัพท์</Label>
                    <Input id="phone" value={hospitalPhone} onChange={(e) => setHospitalPhone(e.target.value)} />
                  </div>
                  <Button type="submit">บันทึกข้อมูล</Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="capacity">
            <Card>
              <CardHeader>
                <CardTitle>จัดการความจุเตียง</CardTitle>
                <CardDescription>อัปเดตจำนวนเตียงว่างและเตียงทั้งหมด</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdateCapacity} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>ICU ทั้งหมด</Label>
                      <Input type="number" value={icuBeds} onChange={(e) => setIcuBeds(Number(e.target.value))} />
                    </div>
                    <div className="space-y-2">
                      <Label>ICU ว่าง</Label>
                      <Input type="number" value={availableIcuBeds} onChange={(e) => setAvailableIcuBeds(Number(e.target.value))} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>เตียงปกติ ทั้งหมด</Label>
                      <Input type="number" value={normalBeds} onChange={(e) => setNormalBeds(Number(e.target.value))} />
                    </div>
                    <div className="space-y-2">
                      <Label>เตียงปกติ ว่าง</Label>
                      <Input type="number" value={availableNormalBeds} onChange={(e) => setAvailableNormalBeds(Number(e.target.value))} />
                    </div>
                  </div>
                  <Button type="submit">อัปเดตความจุ</Button>
                </form>
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
