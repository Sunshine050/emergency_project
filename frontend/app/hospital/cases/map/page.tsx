"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useAuth } from "@/shared/hooks/useAuth";
import { useNotifications } from "@/shared/hooks/useNotifications";
import { useHospitalCases } from "../hooks/useHospitalCases";
import DashboardLayout from "@components/dashboard/dashboard-layout";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { Badge } from "@components/ui/badge";
import { 

  Search, 
  Filter, 
  X,
  MapPin,
  AlertTriangle,
  Clock,
  User,
  Phone,
  Navigation
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@components/ui/select";
import { TransferToRescueDialog } from "../components/TransferToRescueDialog";
import { format } from "date-fns";
import { th } from "date-fns/locale";

// Dynamic import for RealTimeMap
const RealTimeMap = dynamic(
  () => import("../components/RealTimeMap").then(mod => ({ default: mod.RealTimeMap })),
  {
    ssr: false,
    loading: () => (
      <div className="h-full flex items-center justify-center bg-slate-100 dark:bg-slate-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-sm text-slate-500">กำลังโหลดแผนที่...</p>
        </div>
      </div>
    ),
  }
);

export default function HospitalMapPage() {
  useAuth();

  const {
    notifications,
    unreadCount,
    onMarkAsRead,
    onMarkAllAsRead,
  } = useNotifications();

  const {
    cases: filteredCases,
    allCases,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    filters,
    setFilters,
    handleTransferCase,
    refetch,
  } = useHospitalCases();

  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [transferDialogOpen, setTransferDialogOpen] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);

  // Auto refresh every 15 seconds


  const selectedCase = selectedCaseId 
    ? filteredCases.find(c => c.id === selectedCaseId) 
    : null;

  const stats = {
    total: filteredCases.length,
    critical: filteredCases.filter(c => c.severity >= 3).length,
    assigned: filteredCases.filter(c => c.status === "assigned").length,
    inProgress: filteredCases.filter(c => c.status === "in-progress").length,
  };

  return (
    <DashboardLayout
      role="hospital"
      notifications={notifications}
      unreadCount={unreadCount}
      onMarkAsRead={onMarkAsRead}
      onMarkAllAsRead={onMarkAllAsRead}
    >
      <div className="h-[calc(100vh-7rem)] md:h-[calc(100vh-8rem)] flex flex-col">
        {/* Header */}
        <div className="bg-white dark:bg-slate-800 border-b px-6 py-4 rounded-t-xl">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <MapPin className="h-6 w-6 text-blue-600" />
              <div>
                <h1 className="text-xl font-bold">แผนที่เคสฉุกเฉิน</h1>
                <p className="text-sm text-slate-500">ติดตามตำแหน่งเคสแบบเรียลไทม์</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Stats Badges */}
              <Badge variant="outline" className="gap-1">
                <span className="font-bold">{stats.total}</span> เคสทั้งหมด
              </Badge>
              <Badge variant="destructive" className="gap-1">
                <span className="font-bold">{stats.critical}</span> เร่งด่วน
              </Badge>
              
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowSidebar(!showSidebar)}
              >
                <Filter className="h-4 w-4 mr-1" />
                {showSidebar ? 'ซ่อน' : 'แสดง'}ตัวกรอง
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden relative">
          {/* Map */}
          <div className="flex-1 relative h-full w-full">
            <RealTimeMap
              cases={filteredCases}
              selectedCaseId={selectedCaseId}
              onCaseSelect={setSelectedCaseId}
              onTransferCase={(caseId) => {
                setSelectedCaseId(caseId);
                setTransferDialogOpen(true);
              }}
              className="h-full w-full"
              autoRefresh={true}
              refreshInterval={15000}
            />
          </div>
        </div>
      </div>

      {/* Transfer Dialog */}
      {selectedCaseId && (
        <TransferToRescueDialog
          open={transferDialogOpen}
          onOpenChange={setTransferDialogOpen}
          caseId={selectedCaseId}
          onTransfer={handleTransferCase}
        />
      )}
    </DashboardLayout>
  );
}
