"use client";

import { useEffect } from "react";
import { useEmergencyCases } from "./hooks/useEmergencyCases";
import DashboardLayout from "@components/dashboard/dashboard-layout";
import { Button } from "@components/ui/button";
import { CaseCard } from "./components/CaseCard";

import {
  Search,
  Filter,
  ChevronDown,
  AlertTriangle,
} from "lucide-react";
import { Input } from "@components/ui/input";
import { Badge } from "@components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@components/ui/dropdown-menu";
import { Card, CardContent } from "@components/ui/card";

export default function EmergencyCenterCases() {
  // Inline auth check
  useEffect(() => {
    if (!localStorage.getItem("access_token")) {
      window.location.href = "/login";
    }
  }, []);

  const {
    cases: filteredCases,
    hospitals,
    loading,
    filters,
    setFilters,
    searchQuery,
    setSearchQuery,
    handleAssignCase,
    refetch,
  } = useEmergencyCases();

  if (loading) {
    return (
      <DashboardLayout
        role="emergency-center"
        notifications={[]}
        unreadCount={0}
        onMarkAsRead={() => {}}
        onMarkAllAsRead={() => {}}
      >
        <div className="p-6 text-center">กำลังโหลดเคส...</div>
      </DashboardLayout>
    );
  }

  const stats = {
    total: filteredCases.length,
    pending: filteredCases.filter((c) => c.status === "pending").length,
    critical: filteredCases.filter((c) => c.severity === 4).length,
    completed: filteredCases.filter((c) => c.status === "completed").length,
  };

  return (
    <DashboardLayout
      role="emergency-center"
      notifications={[]}
      unreadCount={0}
      onMarkAsRead={() => {}}
      onMarkAllAsRead={() => {}}
    >
      <div className="p-6 space-y-6">
        {/* ฟอร์มค้นหาและตัวกรอง */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
            <Input
              type="search"
              placeholder="ค้นหาด้วย ID, ชื่อ, หรือประเภท..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Select
              value={filters.status}
              onValueChange={(value) =>
                setFilters({ ...filters, status: value })
              }
            >
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="สถานะ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทุกสถานะ</SelectItem>
                <SelectItem value="pending">รอการดำเนินการ</SelectItem>
                <SelectItem value="assigned">มอบหมายแล้ว</SelectItem>
                <SelectItem value="in-progress">กำลังดำเนินการ</SelectItem>
                <SelectItem value="completed">เสร็จสิ้น</SelectItem>
                <SelectItem value="cancelled">ยกเลิก</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filters.severity}
              onValueChange={(value) =>
                setFilters({ ...filters, severity: value })
              }
            >
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="ระดับความรุนแรง" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทุกระดับ</SelectItem>
                <SelectItem value="1">ระดับ 1 (เล็กน้อย)</SelectItem>
                <SelectItem value="2">ระดับ 2 (ปานกลาง)</SelectItem>
                <SelectItem value="3">ระดับ 3 (รุนแรง)</SelectItem>
                <SelectItem value="4">ระดับ 4 (วิกฤต)</SelectItem>
              </SelectContent>
            </Select>

            {/* ตัวกรองเพิ่มเติมเป็น DropdownMenu (เหมือนเดิม) */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  ตัวกรองเพิ่มเติม
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuLabel>ช่วงวันที่</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem
                  checked={filters.date === "all"}
                  onCheckedChange={() =>
                    setFilters({ ...filters, date: "all" })
                  }
                >
                  ทุกวันที่
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={filters.date === "today"}
                  onCheckedChange={() =>
                    setFilters({ ...filters, date: "today" })
                  }
                >
                  วันนี้
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={filters.date === "yesterday"}
                  onCheckedChange={() =>
                    setFilters({ ...filters, date: "yesterday" })
                  }
                >
                  เมื่อวาน
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={filters.date === "week"}
                  onCheckedChange={() =>
                    setFilters({ ...filters, date: "week" })
                  }
                >
                  สัปดาห์นี้
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button onClick={refetch} disabled={loading}>
              รีเฟรช
            </Button>
          </div>
        </div>

        {/* สถิติ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-white dark:bg-slate-800 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  รวมทั้งหมด
                </p>
                <Badge className="bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200">
                  {stats.total}
                </Badge>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-slate-800 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  รอการดำเนินการ
                </p>
                <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-500">
                  {stats.pending}
                </Badge>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-slate-800 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  วิกฤต
                </p>
                <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-500">
                  {stats.critical}
                </Badge>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-slate-800 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  เสร็จสิ้น
                </p>
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500">
                  {stats.completed}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* แสดงรายการเคส */}
        <div className="space-y-4">
          {filteredCases.length === 0 ? (
            <Card className="text-center py-8 bg-white dark:bg-slate-800 shadow-sm">
              <CardContent>
                <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-slate-400" />
                <p className="text-slate-500 dark:text-slate-400">
                  ไม่พบเคสที่ตรงกับเกณฑ์การค้นหา
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredCases.map((emergencyCase) => (
                <CaseCard
                  key={emergencyCase.id}
                  {...emergencyCase}
                  hospitals={hospitals}
                  onAssign={handleAssignCase}
                  role="emergency-center"
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
