// app/1669/reports/hooks/useReports.ts
import { useState, useEffect, useMemo, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useToast } from "@/shared/hooks/use-toast";
import { fetchReports } from "@/shared/services/emergencyService";
import { fetchDashboardStats } from "@/shared/services/dashboardService";
import { fetchNotifications, markNotificationAsRead, markAllNotificationsAsRead } from "@/shared/services/notificationService";
import { generatePDF, handleDownloadAll } from "@/shared/utils/pdfUtils";
import { Report, DashboardStats, Notification } from "@/shared/types";
import { FilterState as Filters } from "@/shared/types";

import { webSocketClient } from "@lib/websocket";

export const useReports = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();

  const [reportType, setReportType] = useState(searchParams.get("type") || "all");
  const [filters, setFilters] = useState<Filters>({
    status: searchParams.get("status") || "all",
    severity: searchParams.get("severity") || "all",
    date: searchParams.get("date") || "all",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [allReports, setAllReports] = useState<Report[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  const fetchAllData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [statsData, reportsData, notificationsData] = await Promise.all([
        fetchDashboardStats(),
        fetchReports(),
        fetchNotifications(),
      ]);
      setStats(statsData);
      setAllReports(reportsData);
      setNotifications(notificationsData);
      setUnreadCount(notificationsData.filter((n) => !n.isRead).length);
    } catch (error) {
      console.error("Error fetching reports data:", error);
      toast({
        title: "ข้อผิดพลาด",
        description: "ไม่สามารถดึงข้อมูลได้ กรุณาลองใหม่",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // alias สำหรับ refetch
  const refetch = useCallback(() => {
    return fetchAllData();
  }, [fetchAllData]);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    webSocketClient.connect(token);

    const statsUpdatedHandler = (data: any) => {
      console.log("Stats updated:", data);
      setStats(data);
    };

    const notificationHandler = (data: Notification) => {
      console.log("Notification received:", data);
      setNotifications((prev) => [data, ...prev]);
      setUnreadCount((prev) => prev + (data.isRead ? 0 : 1));
      toast({ title: data.title, description: data.body });
    };

    webSocketClient.on("statsUpdated", statsUpdatedHandler);
    webSocketClient.on("notification", notificationHandler);
    fetchAllData();

    return () => {
      webSocketClient.off("statsUpdated", statsUpdatedHandler);
      webSocketClient.off("notification", notificationHandler);
      webSocketClient.disconnect();
    };
  }, [fetchAllData, toast]);

  const updateFilters = useCallback(
    (key: keyof Filters, value: string) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
      router.push(
        `?${new URLSearchParams({ ...Object.fromEntries(searchParams), [key]: value }).toString()}`
      );
    },
    [searchParams, router]
  );

  const filteredReports = useMemo(() => {
    return allReports.filter((report) => {
      const matchesSearch =
        report.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.stats.patientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.type.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = reportType === "all" || report.type === reportType;
      const matchesStatus = filters.status === "all" || report.stats.status === filters.status;
      const matchesSeverity = filters.severity === "all" || report.stats.severity?.toString() === filters.severity;
      let matchesDate = true;
      if (filters.date !== "all") {
        const reportDate = new Date(report.date);
        if (isNaN(reportDate.getTime())) return false;
        const today = new Date();
        if (filters.date === "today") {
          matchesDate = reportDate.toDateString() === today.toDateString();
        } else if (filters.date === "yesterday") {
          const yesterday = new Date(today);
          yesterday.setDate(today.getDate() - 1);
          matchesDate = reportDate.toDateString() === yesterday.toDateString();
        } else if (filters.date === "week") {
          const oneWeekAgo = new Date(today);
          oneWeekAgo.setDate(today.getDate() - 7);
          matchesDate = reportDate >= oneWeekAgo && reportDate <= today;
        }
      }
      return matchesSearch && matchesType && matchesStatus && matchesSeverity && matchesDate;
    });
  }, [allReports, searchQuery, reportType, filters]);

  const filteredStats = useMemo(
    () => ({
      total: filteredReports.length,
      pending: filteredReports.filter((r) => r.stats.status === "pending").length,
      critical: filteredReports.filter((r) => r.stats.severity === 4).length,
      completed: filteredReports.filter((r) => r.stats.status === "completed").length,
    }),
    [filteredReports]
  );

  const handleDownload = useCallback(
    (report: Report) => {
      try {
        const doc = generatePDF(report);
        doc.save(`${report.title}.pdf`);
        toast({ title: "ดาวน์โหลดสำเร็จ", description: "รายงานถูกดาวน์โหลดเรียบร้อยแล้ว" });
      } catch (error) {
        console.error("Error downloading report:", error);
        toast({
          title: "ข้อผิดพลาด",
          description: "ไม่สามารถดาวน์โหลดรายงานได้ กรุณาลองใหม่",
          variant: "destructive",
        });
      }
    },
    [toast]
  );

  const handleDownloadAllCallback = useCallback(() => {
    handleDownloadAll(filteredReports, toast);
  }, [filteredReports, toast]);

  const handleView = useCallback((report: Report) => setSelectedReport(report), []);

  const handleTypeChange = useCallback(
    (value: string) => {
      setReportType(value);
      router.push(`?${new URLSearchParams({ ...Object.fromEntries(searchParams), type: value }).toString()}`);
    },
    [searchParams, router]
  );

  const handleFilterChange = useCallback((key: keyof Filters, value: string) => updateFilters(key, value), [updateFilters]);

  return {
    stats,
    reports: filteredReports,
    filteredStats,
    filters,
    reportType,
    searchQuery,
    setSearchQuery,
    notifications,
    unreadCount,
    isLoading,
    selectedReport,
    setSelectedReport,
    handleView,
    handleDownload,
    handleDownloadAll: handleDownloadAllCallback,
    handleTypeChange,
    handleFilterChange,
    onMarkAsRead: markNotificationAsRead,
    onMarkAllAsRead: markAllNotificationsAsRead,
    refetch, // <-- เพิ่มตรงนี้
  };
};
