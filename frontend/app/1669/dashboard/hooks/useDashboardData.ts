import { useState, useEffect, useMemo } from "react";
import { useToast } from "@/shared/hooks/use-toast";
import { fetchDashboardStats } from "@/shared/services/dashboardService";
import { fetchActiveEmergencies } from "@/shared/services/emergencyService";
import { fetchNotifications, markAsRead, markAllAsRead } from "@/shared/services/notificationService";
import { processCaseDataForCharts } from "@/shared/utils/dashboardUtils";
import { EmergencyCase, DashboardStats, Notification, MonthlyTrendData } from "@/shared/types";
import { webSocketClient } from "@lib/websocket";

export const useDashboardData = () => {
  const [cases, setCases] = useState<EmergencyCase[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [monthlyTrendData, setMonthlyTrendData] = useState<MonthlyTrendData[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState("12-months");
  const [searchQuery, setSearchQuery] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);

  // ✅ เพิ่ม state ที่ขาด
  const [open, setOpen] = useState(false);
  const [selectedCase, setSelectedCase] = useState<EmergencyCase | null>(null);

  const { toast } = useToast();

  const fetchAllData = async (token: string) => {
    try {
      const [statsData, emergenciesData, notificationsData] = await Promise.all([
        fetchDashboardStats(),
        fetchActiveEmergencies(),
        fetchNotifications(),
      ]);

      setStats(statsData);
      setCases(emergenciesData);
      setNotifications(notificationsData);
      setUnreadCount(notificationsData.filter((n) => !n.isRead).length);
      setMonthlyTrendData(processCaseDataForCharts(emergenciesData, selectedPeriod));
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast({
        title: "ข้อผิดพลาด",
        description: "ไม่สามารถดึงข้อมูลได้",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    const token = localStorage.getItem("access_token");
    if (!token) return;

    webSocketClient.connect(token);

    const statusUpdateHandler = (data: any) => {
      setCases((prevCases) => {
        const updatedCases = prevCases.map((c) =>
          c.id === data.emergencyId
            ? { ...c, status: data.status.toLowerCase(), assignedTo: data.assignedTo || c.assignedTo }
            : c
        );
        setMonthlyTrendData(processCaseDataForCharts(updatedCases, selectedPeriod));
        return updatedCases;
      });
      toast({ title: "อัปเดตสถานะ", description: `เคส ${data.emergencyId} อัปเดตเป็น ${data.status}` });
    };

    const notificationHandler = (data: any) => {
      setNotifications((prev) => [data, ...prev]);
      setUnreadCount((prev) => prev + (data.isRead ? 0 : 1));
      toast({ title: data.title, description: data.body });
    };

    const emergencyHandler = (data: any) => {
      const newCase: EmergencyCase = {
        id: data.id,
        description: (data.description || "No description available").slice(0, 50) + "...",
        descriptionFull: data.description || "No description available",
        status: "pending",
        grade: (data.grade || "NON_URGENT").toUpperCase() as "CRITICAL" | "URGENT" | "NON_URGENT",
        severity: data.severity || "LOW", // ✅ เพิ่มค่า severity ที่ขาด
        reportedAt: new Date().toISOString(),
        patientName: "Unknown",
        contactNumber: "",
        emergencyType: data.type || "Unknown",
        location: {
          address: data.location || "Unknown",
          coordinates: { lat: data.coordinates?.lat || 0, lng: data.coordinates?.lng || 0 },
        },
        assignedTo: data.assignedTo,
        symptoms: [],
      };
      setCases((prev) => {
        const updatedCases = [newCase, ...prev];
        setMonthlyTrendData(processCaseDataForCharts(updatedCases, selectedPeriod));
        return updatedCases;
      });
      toast({ title: "เคสฉุกเฉินใหม่", description: `เคส ${data.id} ถูกสร้าง` });
    };

    const hospitalCreatedHandler = (data: any) => {
      setStats((prev) =>
        prev ? { ...prev, connectedHospitals: prev.connectedHospitals + 1 } : prev
      );
      toast({ title: "โรงพยาบาลใหม่", description: `โรงพยาบาล ${data.name} ถูกสร้าง` });
    };

    const statsUpdatedHandler = (data: any) => {
      setStats(data);
    };

    webSocketClient.onStatusUpdate(statusUpdateHandler);
    webSocketClient.on("notification", notificationHandler);
    webSocketClient.onEmergency(emergencyHandler);
    webSocketClient.on("hospitalCreated", hospitalCreatedHandler);
    webSocketClient.on("statsUpdated", statsUpdatedHandler);

    const checkConnection = setInterval(() => {
      if (webSocketClient && !webSocketClient["socket"]?.connected) {
        webSocketClient.connect(token);
      }
    }, 5000);

    fetchAllData(token);

    return () => {
      clearInterval(checkConnection);
      webSocketClient.disconnect();
    };
  }, [toast, selectedPeriod]);

  const filteredCases = useMemo(
    () =>
      cases.filter((c) => {
        const q = searchQuery.toLowerCase();
        return (
          c.id.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.patientName.toLowerCase().includes(q) ||
          c.emergencyType.toLowerCase().includes(q)
        );
      }),
    [cases, searchQuery]
  );

  const pendingCases = useMemo(() => cases.filter((c) => c.status === "pending").length, [cases]);
  const assignedCases = useMemo(() => cases.filter((c) => c.status === "assigned").length, [cases]);
  const inProgressCases = useMemo(
    () => cases.filter((c) => c.status === "in-progress").length,
    [cases]
  );
  const criticalCases = useMemo(() => cases.filter((c) => c.grade === "CRITICAL").length, [cases]);

  const handleViewDetails = (caseItem: EmergencyCase) => {
    setSelectedCase(caseItem);
    setOpen(true);
  };

  const handleMarkAsRead = async (id: string) => {
    await markAsRead(id);
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  return {
    stats,
    cases: filteredCases,
    monthlyTrendData,
    selectedPeriod,
    setSelectedPeriod,
    searchQuery,
    setSearchQuery,
    notifications,
    unreadCount,
    pendingCases,
    assignedCases,
    inProgressCases,
    criticalCases,
    open,
    setOpen,
    selectedCase,
    setSelectedCase,
    handleViewDetails,
    handleMarkAsRead,
    handleMarkAllAsRead,
  };
};
