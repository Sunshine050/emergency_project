// app/hospital/reports/page.tsx
"use client";

import React, { useState, useMemo, useEffect } from "react";
import DashboardLayout from "@components/dashboard/dashboard-layout";
import { useAuth } from "@/shared/hooks/useAuth";
import { useNotifications } from "@/shared/hooks/useNotifications";
import { useHospitalCases } from "../cases/hooks/useHospitalCases";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@components/ui/select";
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
  Tooltip,
} from "recharts";
import { 
  RefreshCw, 
  Bed, 
  AlertCircle, 
  Printer, 
  Download, 
  FileText, 
  Clock,
  Heart,
} from "lucide-react";
import { Badge } from "@components/ui/badge";
import { CSVLink } from "react-csv";

const HospitalReportsPageContent = () => {
  useAuth();
  const { notifications } = useNotifications();
  const { cases, loading, refetch } = useHospitalCases();
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [timePeriod, setTimePeriod] = useState("month");
  const [currentDate, setCurrentDate] = useState<string>("");

  // Set current date on client side only to avoid hydration mismatch
  useEffect(() => {
    setCurrentDate(new Date().toLocaleDateString('th-TH', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    }));
  }, []);

  // Helper function to get location string
  const getLocationString = (location: any): string => {
    if (!location) return "-";
    if (typeof location === 'string') return location;
    if (location.address) return location.address;
    return "-";
  };

  // Filter cases
  const filteredCases = useMemo(() => {
    return cases.filter((c) => {
      const query = searchQuery.toLowerCase();
      const locationStr = getLocationString(c.location);
      
      const matchesQuery =
        c.patientName?.toLowerCase().includes(query) ||
        locationStr.toLowerCase().includes(query) ||
        c.grade?.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "ALL" ? true : c.status === statusFilter;

      return matchesQuery && matchesStatus;
    });
  }, [cases, searchQuery, statusFilter]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalCases = cases.length;
    const criticalCases = cases.filter(c => c.grade === 'CRITICAL').length;
    const urgentCases = cases.filter(c => c.grade === 'URGENT').length;
    const normalCases = cases.filter(c => c.grade === 'NON_URGENT').length;
    
    const pendingCases = cases.filter(c => c.status === 'pending').length;
    const inProgressCases = cases.filter(c => c.status === 'in-progress').length;
    const completedCases = cases.filter(c => c.status === 'completed').length;
    
    // Mock data for additional stats
    const avgResponseTime = 8;
    const availableBeds = 45;
    const totalBeds = 300;
    const icuAvailable = 8;
    const icuTotal = 25;
    
    return {
      totalCases,
      criticalCases,
      urgentCases,
      normalCases,
      pendingCases,
      inProgressCases,
      completedCases,
      avgResponseTime,
      availableBeds,
      totalBeds,
      icuAvailable,
      icuTotal,
    };
  }, [cases]);

  // Chart data
  const gradeChartData = [
    { name: "วิกฤต", value: stats.criticalCases, color: "#ef4444" },
    { name: "เร่งด่วน", value: stats.urgentCases, color: "#f59e0b" },
    { name: "ปกติ", value: stats.normalCases, color: "#10b981" },
  ];

  const statusChartData = [
    { name: "รอดำเนินการ", value: stats.pendingCases },
    { name: "กำลังดำเนินการ", value: stats.inProgressCases },
    { name: "เสร็จสิ้น", value: stats.completedCases },
  ];

  const trendData = [
    { day: "จ", cases: 45, critical: 8 },
    { day: "อ", cases: 52, critical: 12 },
    { day: "พ", cases: 38, critical: 6 },
    { day: "พฤ", cases: 65, critical: 15 },
    { day: "ศ", cases: 48, critical: 9 },
    { day: "ส", cases: 42, critical: 7 },
    { day: "อา", cases: 55, critical: 11 },
  ];

  const handlePrint = () => {
    window.print();
  };

  // CSV Data - ใช้ reportedAt แทน createdAt
  const csvHeaders = [
    { label: "ชื่อผู้ป่วย", key: "patientName" },
    { label: "ระดับความรุนแรง", key: "grade" },
    { label: "สถานะ", key: "status" },
    { label: "สถานที่", key: "location" },
    { label: "วันที่-เวลา", key: "reportedAt" },
  ];

  const csvData = filteredCases.map(c => ({
    patientName: c.patientName || "-",
    grade: c.grade,
    status: c.status,
    location: getLocationString(c.location),
    reportedAt: new Date(c.reportedAt).toLocaleString('th-TH'),
  }));

  const csvFilename = `hospital-cases-report-${new Date().toISOString().split('T')[0]}.csv`;

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-8 shadow-xl">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]"></div>
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
              <FileText className="h-10 w-10" />
              รายงานสรุปข้อมูลโรงพยาบาล
            </h1>
            <p className="text-blue-100 text-sm">
              ข้อมูล ณ วันที่ {currentDate || 'กำลังโหลด...'}
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={refetch} 
              variant="outline"
              className="bg-white/10 hover:bg-white/20 text-white border-white/20"
            >
              <RefreshCw className="h-4 w-4 mr-2" /> รีเฟรช
            </Button>
            
            <CSVLink 
              data={csvData} 
              headers={csvHeaders} 
              filename={csvFilename}
              className="inline-flex"
            >
              <Button 
                variant="outline"
                className="bg-white/10 hover:bg-white/20 text-white border-white/20"
              >
                <Download className="h-4 w-4 mr-2" /> CSV
              </Button>
            </CSVLink>

            <Button 
              onClick={handlePrint} 
              className="bg-white text-blue-700 hover:bg-blue-50"
            >
              <Printer className="h-4 w-4 mr-2" /> พิมพ์ / PDF
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-red-500 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">เคสวิกฤต</p>
                <p className="text-3xl font-bold text-red-600 mt-2">{stats.criticalCases}</p>
                <p className="text-xs text-slate-400 mt-1">จากทั้งหมด {stats.totalCases} เคส</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">เตียงว่าง</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">{stats.availableBeds}</p>
                <p className="text-xs text-slate-400 mt-1">จากทั้งหมด {stats.totalBeds} เตียง</p>
              </div>
              <Bed className="h-8 w-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">ICU ว่าง</p>
                <p className="text-3xl font-bold text-purple-600 mt-2">{stats.icuAvailable}</p>
                <p className="text-xs text-slate-400 mt-1">จากทั้งหมด {stats.icuTotal} เตียง</p>
              </div>
              <Heart className="h-8 w-8 text-purple-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">เวลาตอบสนองเฉลี่ย</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{stats.avgResponseTime}</p>
                <p className="text-xs text-slate-400 mt-1">นาที</p>
              </div>
              <Clock className="h-8 w-8 text-green-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="shadow-md border-0 bg-slate-50 dark:bg-slate-800">
        <CardContent className="p-4 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="ค้นหาชื่อผู้ป่วย, สถานที่..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white"
            />
          </div>
          <Select onValueChange={setStatusFilter} value={statusFilter}>
            <SelectTrigger className="w-full sm:w-56 bg-white">
              <SelectValue placeholder="สถานะ" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">ทั้งหมด</SelectItem>
              <SelectItem value="pending">รอดำเนินการ</SelectItem>
              <SelectItem value="in-progress">กำลังดำเนินการ</SelectItem>
              <SelectItem value="completed">เสร็จสิ้น</SelectItem>
            </SelectContent>
          </Select>
          <Select onValueChange={setTimePeriod} value={timePeriod}>
            <SelectTrigger className="w-full sm:w-56 bg-white">
              <SelectValue placeholder="ช่วงเวลา" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">7 วันที่ผ่านมา</SelectItem>
              <SelectItem value="month">30 วันที่ผ่านมา</SelectItem>
              <SelectItem value="quarter">3 เดือนที่ผ่านมา</SelectItem>
              <SelectItem value="year">1 ปีที่ผ่านมา</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-lg">สัดส่วนระดับความรุนแรง</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={gradeChartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {gradeChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-lg">สถานะการดำเนินการ</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer>
              <BarChart data={statusChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-lg">แนวโน้มรายสัปดาห์</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="cases" stroke="#3b82f6" name="เคสทั้งหมด" />
                <Line type="monotone" dataKey="critical" stroke="#ef4444" name="เคสวิกฤต" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card className="shadow-md border-0">
        <CardHeader className="bg-slate-50 border-b">
          <CardTitle className="text-lg flex items-center justify-between">
            <span>ตารางข้อมูลเคสฉุกเฉิน</span>
            <Badge variant="outline">{filteredCases.length} เคส</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-100 text-slate-600 font-medium">
                <tr>
                  <th className="px-4 py-3">ชื่อผู้ป่วย</th>
                  <th className="px-4 py-3">ระดับความรุนแรง</th>
                  <th className="px-4 py-3">สถานะ</th>
                  <th className="px-4 py-3">สถานที่</th>
                  <th className="px-4 py-3">วันที่-เวลา</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCases.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium">{c.patientName || "-"}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        c.grade === 'CRITICAL' ? 'bg-red-100 text-red-700' :
                        c.grade === 'URGENT' ? 'bg-orange-100 text-orange-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {c.grade === 'CRITICAL' ? 'วิกฤต' : c.grade === 'URGENT' ? 'เร่งด่วน' : 'ปกติ'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        c.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        c.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {c.status === 'pending' ? 'รอดำเนินการ' : 
                         c.status === 'in-progress' ? 'กำลังดำเนินการ' : 'เสร็จสิ้น'}
                      </span>
                    </td>
                    <td className="px-4 py-3">{getLocationString(c.location)}</td>
                    <td className="px-4 py-3">{new Date(c.reportedAt).toLocaleString('th-TH')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const HospitalReportsPage = () => {
  const { notifications } = useNotifications();
  
  return (
    <DashboardLayout
      role="hospital"
      notifications={notifications}
      unreadCount={0}
      onMarkAsRead={() => {}}
      onMarkAllAsRead={() => {}}
    >
      <HospitalReportsPageContent />
    </DashboardLayout>
  );
};

export default HospitalReportsPage;