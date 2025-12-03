// app/1669/hospitals/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { useHospitals } from "./hooks/useHospitals";
import { useAuth } from "@/shared/hooks/useAuth";
import DashboardLayout from "@components/dashboard/dashboard-layout";
import { Input } from "@components/ui/input";
import { Search, AlertTriangle, Loader2 } from "lucide-react";
import { Card, CardContent } from "@components/ui/card";
import { HospitalCard } from "./components/HospitalCard";

// ✅ แก้ path ให้ถูกต้อง (ถอยขึ้นสองระดับถึง hospital/reports/components)
import { HospitalReportsStatsCards as HospitalStatsCards } from "../../hospital/reports/components/HospitalReportsStatsCards";

export default function HospitalsPage() {
  useAuth(); // Auto-redirect if no token

  const {
    hospitals: filteredHospitals,
    stats,
    loading,
    updatingId,
    searchQuery,
    setSearchQuery,
    handleUpdateStatus,
    handleContactHospital,
    statusColors,
    getCaseStatusLabel,
    refetch,
  } = useHospitals();

  const router = useRouter();

  if (loading) {
    return (
      <DashboardLayout
        role="emergency-center"
        notifications={[]}
        unreadCount={0}
        onMarkAsRead={() => {}}
        onMarkAllAsRead={() => {}}
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-center text-slate-500">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
            กำลังโหลดข้อมูลโรงพยาบาล...
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      role="emergency-center"
      notifications={[]}
      unreadCount={0}
      onMarkAsRead={() => {}}
      onMarkAllAsRead={() => {}}
    >
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              โรงพยาบาล
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              จัดการข้อมูลโรงพยาบาลที่เชื่อมต่อระบบฉุกเฉิน
            </p>
          </div>
          <div className="relative flex-grow max-w-md">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
            <Input
              type="search"
              placeholder="ค้นหาโรงพยาบาล ชื่อ ที่อยู่ จังหวัด หรือเบอร์โทร..."
              className="pl-8 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* ✅ ใช้ component ได้ถูกต้อง */}
        <HospitalStatsCards stats={stats} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredHospitals.length === 0 ? (
            <Card className="col-span-full border border-slate-200 dark:border-slate-700 shadow-sm">
              <CardContent className="py-12 text-center">
                <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-slate-400" />
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
                  ไม่พบข้อมูล
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  ไม่พบโรงพยาบาลที่ตรงกับเกณฑ์การค้นหา
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  ลองค้นหาด้วยชื่อหรือที่อยู่
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredHospitals.map((hospital) => (
              <HospitalCard
                key={hospital.id}
                hospital={hospital}
                onContact={handleContactHospital}
              />
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
