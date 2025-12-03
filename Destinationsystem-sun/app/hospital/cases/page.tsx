"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useHospitalCases } from "./hooks/useHospitalCases";
import { MapLocation as SharedMapLocation } from "@/shared/types"; // ใช้จาก shared
import { useAuth } from "@/shared/hooks/useAuth";
import { useNotifications } from "@/shared/hooks/useNotifications";
import DashboardLayout from "@components/dashboard/dashboard-layout";
import { Button } from "@components/ui/button";
import { Search, Filter, MapPin, ChevronDown, AlertTriangle, RefreshCw } from "lucide-react";
import { Input } from "@components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@components/ui/dropdown-menu";
import { HospitalCaseCard } from "./components/HospitalCaseCard";
import { HospitalStatusCards } from "@/shared/components/StatsCards";
import { Skeleton } from "@components/ui/skeleton";
import { Badge } from "@components/ui/badge";
import { TransferToRescueDialog } from "./components/TransferToRescueDialog";

// โหลด RealTimeMap แบบ dynamic + ปิด SSR
const RealTimeMap = dynamic(
  () => import("./components/RealTimeMap").then(mod => ({ default: mod.RealTimeMap })),
  {
    ssr: false,
    loading: () => (
      <div className="h-96 lg:h-[600px] flex items-center justify-center bg-slate-50 rounded-lg border">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-sm text-slate-500">กำลังโหลดแผนที่...</p>
        </div>
      </div>
    ),
  }
);

export default function HospitalCases() {
  useAuth();

  // ใช้ notifications hook เต็ม
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
    viewMode,
    setViewMode,
    filters,
    setFilters,
    handleTransferCase,
    getMapLocations: getMapLocationsFromHook,
    refetch,
  } = useHospitalCases();

  const [transferDialogOpen, setTransferDialogOpen] = useState(false);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<SharedMapLocation | null>(null);

  const stats = {
    total: allCases.length,
    assigned: allCases.filter((c) => c.status === "assigned").length,
    critical: allCases.filter((c) => c.severity === 4).length,
    inProgress: allCases.filter((c) => c.status === "in-progress").length,
  };

  // Auto refresh ทุก 15 วินาที
  useEffect(() => {
    const interval = setInterval(refetch, 15000);
    return () => clearInterval(interval);
  }, [refetch]);

  // Loading State
  if (loading) {
    return (
      <DashboardLayout
        role="hospital"
        notifications={notifications}
        unreadCount={unreadCount}
        onMarkAsRead={onMarkAsRead}
        onMarkAllAsRead={onMarkAllAsRead}
      >
        <div className="space-y-6 p-6">
          <div className="flex justify-between items-center">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-10 w-10 rounded-full" />
          </div>
          <div className="flex gap-4">
            <Skeleton className="h-10 flex-grow" />
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {[...Array(4)].map((_i, index) => (
              <Skeleton key={index} className="h-48 rounded-lg" />
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Error State
  if (error) {
    return (
      <DashboardLayout
        role="hospital"
        notifications={notifications}
        unreadCount={unreadCount}
        onMarkAsRead={onMarkAsRead}
        onMarkAllAsRead={onMarkAllAsRead}
      >
        <div className="flex flex-col items-center justify-center py-12 px-6">
          <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-lg font-semibold mb-2">ไม่สามารถโหลดข้อมูลได้</h3>
          <p className="text-slate-500 mb-4 text-center max-w-md">{error}</p>
          <Button onClick={refetch} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            ลองใหม่
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      role="hospital"
      notifications={notifications}
      unreadCount={unreadCount}
      onMarkAsRead={onMarkAsRead}
      onMarkAllAsRead={onMarkAllAsRead}
    >
      <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950/50 p-6 space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent flex items-center gap-3">
              Emergency Cases
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              Real-time case management and tracking
            </p>
          </div>
          
          <div className="flex bg-white dark:bg-slate-900 p-1 rounded-lg border shadow-sm">
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className={viewMode === "list" ? "bg-slate-900 text-white shadow-sm" : "text-slate-500"}
            >
              List View
            </Button>
            <Button
              variant={viewMode === "map" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("map")}
              className={viewMode === "map" ? "bg-slate-900 text-white shadow-sm" : "text-slate-500"}
            >
              <MapPin className="h-4 w-4 mr-1" />
              Map View
            </Button>
          </div>
        </div>

        {/* Stats Overview - Custom Design */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-2">
              <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="h-5 w-5 text-blue-600 dark:text-blue-400 font-bold flex items-center justify-center">#</div>
              </div>
              <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100">Total</Badge>
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">{stats.total}</div>
            <p className="text-xs text-slate-500 mt-1">All active cases</p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-2">
              <div className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <Badge variant="secondary" className="bg-amber-50 text-amber-700 hover:bg-amber-100">Assigned</Badge>
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">{stats.assigned}</div>
            <p className="text-xs text-slate-500 mt-1">Waiting for action</p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-2">
              <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <div className="h-5 w-5 text-red-600 dark:text-red-400 flex items-center justify-center font-bold">!</div>
              </div>
              <Badge variant="secondary" className="bg-red-50 text-red-700 hover:bg-red-100">Critical</Badge>
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">{stats.critical}</div>
            <p className="text-xs text-slate-500 mt-1">Grade 4 cases</p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-2">
              <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <RefreshCw className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <Badge variant="secondary" className="bg-purple-50 text-purple-700 hover:bg-purple-100">In Progress</Badge>
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">{stats.inProgress}</div>
            <p className="text-xs text-slate-500 mt-1">Being treated</p>
          </div>
        </div>

        {/* Filters & Content */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          {/* Filter Bar */}
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                type="search"
                placeholder="Search cases by ID, patient name..."
                className="pl-9 bg-white dark:bg-slate-950 border-slate-200 focus:ring-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Select value={filters.status} onValueChange={(v) => setFilters({ ...filters, status: v })}>
                <SelectTrigger className="w-[140px] bg-white dark:bg-slate-950">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="assigned">Assigned</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filters.severity} onValueChange={(v) => setFilters({ ...filters, severity: v })}>
                <SelectTrigger className="w-[140px] bg-white dark:bg-slate-950">
                  <SelectValue placeholder="Severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Grades</SelectItem>
                  <SelectItem value="1">Grade 1</SelectItem>
                  <SelectItem value="2">Grade 2</SelectItem>
                  <SelectItem value="3">Grade 3</SelectItem>
                  <SelectItem value="4">Grade 4</SelectItem>
                </SelectContent>
              </Select>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="bg-white dark:bg-slate-950">
                    <Filter className="h-4 w-4 mr-2" />
                    More
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Time Range</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {["all", "today", "yesterday", "week"].map((val) => (
                    <DropdownMenuCheckboxItem
                      key={val}
                      checked={filters.date === val}
                      onCheckedChange={() => setFilters({ ...filters, date: val })}
                    >
                      {val === "all" ? "All Time" : val.charAt(0).toUpperCase() + val.slice(1)}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Content Area */}
          <div className="p-6 bg-slate-50/30 dark:bg-slate-900/30 min-h-[500px]">
            {viewMode === "list" ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredCases.length === 0 ? (
                  <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
                    <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-full mb-4">
                      <AlertTriangle className="h-8 w-8 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-medium text-slate-900 dark:text-white">No cases found</h3>
                    <p className="text-slate-500 dark:text-slate-400 max-w-sm mt-1">
                      Try adjusting your search or filters to find what you're looking for.
                    </p>
                  </div>
                ) : (
                  filteredCases.map((emergencyCase) => (
                    <div key={emergencyCase.id} className="transform transition-all duration-200 hover:-translate-y-1">
                      <HospitalCaseCard
                        {...emergencyCase}
                        onTransfer={(caseId) => {
                          setSelectedCaseId(caseId);
                          setTransferDialogOpen(true);
                        }}
                      />
                    </div>
                  ))
                )}
              </div>
            ) : (
              <div className="h-[600px] rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-inner">
                <RealTimeMap
                  cases={filteredCases}
                  selectedCaseId={selectedLocation?.id || null}
                  onCaseSelect={(caseId) => {
                    const caseData = filteredCases.find(c => c.id === caseId);
                    if (caseData) {
                      setSelectedLocation({
                        id: caseData.id,
                        title: `Case #${caseData.id.slice(0, 8)}`,
                        severity: caseData.severity,
                        coordinates: [caseData.location.coordinates.lat, caseData.location.coordinates.lng],
                        address: caseData.location.address,
                        description: caseData.description,
                        patientName: caseData.patientName,
                        status: caseData.status,
                      });
                    }
                  }}
                  onTransferCase={(caseId) => {
                    setSelectedCaseId(caseId);
                    setTransferDialogOpen(true);
                  }}
                  className="h-full w-full"
                  autoRefresh={true}
                  refreshInterval={15000}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Transfer to Rescue Dialog */}
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