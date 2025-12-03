"use client";

import React, { useState, useMemo } from "react";
import DashboardLayout from "@components/dashboard/dashboard-layout";
import { useHospitals } from "../hospitals/hooks/useHospitals";
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
} from "recharts";
import { RefreshCw, Hospital, Bed, Activity, AlertCircle, Printer, Download, FileText } from "lucide-react";
import { Badge } from "@components/ui/badge";
import { CSVLink } from "react-csv";

const ReportsPageContent = () => {
  const { hospitals, cases, loading, searchQuery, setSearchQuery, refetch } = useHospitals();
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const filteredHospitals = useMemo(() => {
    return hospitals.filter((h) => {
      const query = searchQuery.toLowerCase();
      const matchesQuery =
        h.name.toLowerCase().includes(query) ||
        (h.address ?? "").toLowerCase().includes(query) ||
        (h.city ?? "").toLowerCase().includes(query) ||
        (h.contactPhone ?? "").includes(query);

      const matchesStatus =
        statusFilter === "ALL" ? true : (h.status ?? "UNKNOWN") === statusFilter;

      return matchesQuery && matchesStatus;
    });
  }, [hospitals, searchQuery, statusFilter]);

  const chartData = useMemo(() => {
    const statusCounts: Record<string, number> = {};
    hospitals.forEach((h) => {
      const key = h.status ?? "UNKNOWN";
      statusCounts[key] = (statusCounts[key] || 0) + 1;
    });
    return Object.keys(statusCounts).map((key) => ({
      name: key,
      value: statusCounts[key],
    }));
  }, [hospitals]);

  const stats = useMemo(() => {
    const totalBeds = hospitals.reduce((sum, h) => sum + (h.medicalInfo?.capacity?.totalBeds || 0), 0);
    const availableBeds = hospitals.reduce((sum, h) => sum + (h.availableBeds || 0), 0);
    const activeHospitals = hospitals.filter(h => h.status === "ACTIVE").length;
    const busyHospitals = hospitals.filter(h => h.status === "BUSY").length;
    const maintenanceHospitals = hospitals.filter(h => h.status === "MAINTENANCE").length;
    
    // Case stats
    const totalCases = cases?.length || 0;
    const criticalCases = cases?.filter(c => c.grade === 'CRITICAL').length || 0;

    return { totalBeds, availableBeds, activeHospitals, busyHospitals, maintenanceHospitals, totalCases, criticalCases };
  }, [hospitals, cases]);

  const COLORS = {
    ACTIVE: "#10b981",
    MAINTENANCE: "#f59e0b",
    BUSY: "#ef4444",
    UNKNOWN: "#94a3b8"
  };

  const getStatusColor = (status: string) => {
    return COLORS[status as keyof typeof COLORS] || COLORS.UNKNOWN;
  };

  const handlePrint = () => {
    window.print();
  };

  // CSV Data Preparation
  const csvHeaders = [
    { label: "ชื่อโรงพยาบาล", key: "name" },
    { label: "สถานะ", key: "status" },
    { label: "ที่อยู่", key: "address" },
    { label: "เมือง", key: "city" },
    { label: "เบอร์โทร", key: "phone" },
    { label: "เตียงทั้งหมด", key: "totalBeds" },
    { label: "เตียงว่าง", key: "availableBeds" },
    { label: "ICU ทั้งหมด", key: "icuBeds" },
    { label: "ICU ว่าง", key: "availableIcuBeds" }
  ];

  const csvData = filteredHospitals.map(h => ({
    name: h.name,
    status: h.status,
    address: h.address || "-",
    city: h.city || "-",
    phone: h.contactPhone || "-",
    totalBeds: h.medicalInfo?.capacity?.totalBeds || 0,
    availableBeds: h.availableBeds || 0,
    icuBeds: h.medicalInfo?.capacity?.icuBeds || 0,
    availableIcuBeds: h.medicalInfo?.capacity?.availableIcuBeds || 0
  }));

  return (
    <div className="space-y-6 pb-8 print:p-0 print:space-y-4">
      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          @page { size: landscape; margin: 10mm; }
          body { -webkit-print-color-adjust: exact; }
          nav, aside, .no-print { display: none !important; }
          .print-only { display: block !important; }
          .card-shadow { box-shadow: none !important; border: 1px solid #ddd !important; }
          /* Hide scrollbars in print */
          ::-webkit-scrollbar { display: none; }
        }
      `}</style>

      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-8 shadow-xl print:shadow-none print:bg-none print:p-0 print:text-black">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px] print:hidden"></div>
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3 print:text-black">
              <FileText className="h-10 w-10" />
              รายงานสรุปข้อมูล 1669
            </h1>
            <p className="text-blue-100 text-sm print:text-slate-600">
              ข้อมูล ณ วันที่ {new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          <div className="flex gap-2 no-print">
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
              filename={`hospital-report-${new Date().toISOString().split('T')[0]}.csv`}
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 print:grid-cols-4">
        <Card className="border-l-4 border-l-green-500 shadow-md card-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">รพ. พร้อมใช้</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{stats.activeHospitals}</p>
              </div>
              <Hospital className="h-8 w-8 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500 shadow-md card-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">เตียงว่างรวม</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">{stats.availableBeds}</p>
                <p className="text-xs text-slate-400">จากทั้งหมด {stats.totalBeds}</p>
              </div>
              <Bed className="h-8 w-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500 shadow-md card-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">เคสวิกฤต (วันนี้)</p>
                <p className="text-3xl font-bold text-red-600 mt-2">{stats.criticalCases}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500 shadow-md card-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">เคสทั้งหมด</p>
                <p className="text-3xl font-bold text-purple-600 mt-2">{stats.totalCases}</p>
              </div>
              <Activity className="h-8 w-8 text-purple-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters (Hidden in Print) */}
      <Card className="shadow-md border-0 bg-slate-50 dark:bg-slate-800 no-print">
        <CardContent className="p-4 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="ค้นหาชื่อ, ที่อยู่..."
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
              <SelectItem value="ACTIVE">พร้อมใช้</SelectItem>
              <SelectItem value="BUSY">ไม่ว่าง</SelectItem>
              <SelectItem value="MAINTENANCE">ปรับปรุง</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Charts (Hidden in Print to save space, or keep if requested. Let's keep them but make them smaller in print) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 print:grid-cols-2 print:break-inside-avoid">
        <Card className="shadow-md card-shadow">
          <CardHeader>
            <CardTitle className="text-lg">สัดส่วนสถานะ</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getStatusColor(entry.name)} />
                  ))}
                </Pie>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-md card-shadow">
          <CardHeader>
            <CardTitle className="text-lg">จำนวนตามสถานะ</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Bar dataKey="value" fill="#3b82f6">
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getStatusColor(entry.name)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card className="shadow-md border-0 card-shadow print:break-before-page">
        <CardHeader className="bg-slate-50 border-b print:bg-white">
          <CardTitle className="text-lg flex items-center justify-between">
            <span>ตารางข้อมูลโรงพยาบาล</span>
            <Badge variant="outline">{filteredHospitals.length} แห่ง</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-100 text-slate-600 font-medium print:bg-slate-200">
                <tr>
                  <th className="px-4 py-3">ชื่อโรงพยาบาล</th>
                  <th className="px-4 py-3">สถานะ</th>
                  <th className="px-4 py-3">จังหวัด</th>
                  <th className="px-4 py-3">เบอร์โทร</th>
                  <th className="px-4 py-3 text-center">เตียงว่าง</th>
                  <th className="px-4 py-3 text-center">ICU ว่าง</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredHospitals.map((h) => (
                  <tr key={h.id} className="hover:bg-slate-50 print:hover:bg-transparent">
                    <td className="px-4 py-3 font-medium">{h.name}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        h.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                        h.status === 'BUSY' ? 'bg-red-100 text-red-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {h.status === 'ACTIVE' ? 'พร้อมใช้' : h.status === 'BUSY' ? 'ไม่ว่าง' : h.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">{h.city || h.state || '-'}</td>
                    <td className="px-4 py-3">{h.contactPhone || '-'}</td>
                    <td className="px-4 py-3 text-center font-bold text-blue-600">
                      {h.availableBeds ?? 0}
                    </td>
                    <td className="px-4 py-3 text-center font-bold text-purple-600">
                      {h.medicalInfo?.capacity?.availableIcuBeds ?? 0}
                      <span className="text-slate-400 font-normal text-xs ml-1">
                        / {h.medicalInfo?.capacity?.icuBeds ?? 0}
                      </span>
                    </td>
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

const ReportsPage = () => {
  return (
    <DashboardLayout
      role="emergency-center"
      notifications={[]}
      unreadCount={0}
      onMarkAsRead={() => {}}
      onMarkAllAsRead={() => {}}
    >
      <ReportsPageContent />
    </DashboardLayout>
  );
};

export default ReportsPage;