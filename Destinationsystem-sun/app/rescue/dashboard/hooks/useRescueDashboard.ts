import { useState, useEffect } from "react";
import { useToast } from "@/shared/hooks/use-toast";

import {
  fetchRescueAssignedCases,
  updateEmergencyStatus,
  cancelCase,
} from "@/shared/services/emergencyService";

import {
  fetchUserProfile,
  saveUserSettings,
  saveHospitalSettings,
  registerUser,
  loginUser,
  refreshToken,
  initiateOAuth,
  verifyToken,
  supabaseLogin,
} from "@/shared/services/authService";

import {
  createRescueTeam,
  fetchRescueTeams,
  fetchRescueTeamById,
  updateRescueTeam,
  updateRescueTeamStatus,
  fetchAvailableTeams,
} from "@/shared/services/rescueService";

import {
  fetchNotifications,
  createNotification,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "@/shared/services/notificationService";

import { EmergencyCase, EmergencyRequestFromApi, ApiRescueTeam } from "@/shared/types";

// ** Import ฟังก์ชันแปลงข้อมูล API → UI **
import { normalizeCaseData } from "@/shared/utils/dataNormalization";

enum UserRole {
  PATIENT = "PATIENT",
  EMERGENCY_CENTER = "EMERGENCY_CENTER",
  HOSPITAL = "HOSPITAL",
  RESCUE_TEAM = "RESCUE_TEAM",
  ADMIN = "ADMIN",
}

export const useRescueDashboard = () => {
  const [cases, setCases] = useState<EmergencyCase[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rescueTeams, setRescueTeams] = useState<ApiRescueTeam[]>([]);

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      try {
        const [apiCases, teamData] = await Promise.all([
          fetchRescueAssignedCases().catch(() => []),
          fetchRescueTeams().catch(() => []),
        ]);

        // แปลง apiCases (EmergencyRequestFromApi[]) เป็น EmergencyCase[]
        const rescueCases: EmergencyCase[] = apiCases.map(normalizeCaseData);

        setCases(rescueCases);
        setRescueTeams(teamData || []);
        setError(null);
      } catch (err: any) {
        setError(err.message || "ไม่สามารถโหลดข้อมูลได้");
        toast({
          title: "Dashboard Error",
          description: "โหลดข้อมูลไม่สำเร็จ มีปัญหาการเชื่อมต่อเซิร์ฟเวอร์",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const handleCompleteCase = async (caseId: string) => {
    try {
      await updateEmergencyStatus(caseId, { status: "completed" });
      setCases((prev) =>
        prev.map((c) => (c.id === caseId ? { ...c, status: "completed" } : c))
      );
      toast({
        title: "Mission completed",
        description: `Case ${caseId} has been successfully completed.`,
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: `ไม่สามารถอัปเดตสถานะเคส: ${err.message || err}`,
        variant: "destructive",
      });
    }
  };

  const handleCancelCase = async (caseId: string) => {
    try {
      await cancelCase(caseId);
      setCases((prev) =>
        prev.map((c) => (c.id === caseId ? { ...c, status: "cancelled" } : c))
      );
      toast({
        title: "Mission cancelled",
        description: `Case ${caseId} has been cancelled.`,
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: `ไม่สามารถยกเลิกเคส: ${err.message || err}`,
        variant: "destructive",
      });
    }
  };

  const filteredCases = cases.filter(
    (c) =>
      c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.emergencyType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    inProgress: cases.filter((c) => c.status === "in-progress").length,
    completed: cases.filter((c) => c.status === "completed").length,
    critical: cases.filter((c) => c.severity === 4).length,
    total: cases.length,
    availableTeams: rescueTeams.filter((t) => t.status === "AVAILABLE").length,
  };

  return {
    cases,
    filteredCases,
    searchQuery,
    setSearchQuery,
    handleCompleteCase,
    handleCancelCase,
    stats,
    loading,
    error,
    setCases,
    rescueTeams,

    fetchUserProfile,
    saveUserSettings,
    saveHospitalSettings,
    registerUser,
    loginUser,
    refreshToken,
    initiateOAuth,
    verifyToken,
    supabaseLogin,

    createRescueTeam,
    fetchRescueTeams,
    fetchRescueTeamById,
    updateRescueTeam,
    updateRescueTeamStatus,
    fetchAvailableTeams,

    fetchNotifications,
    createNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    markNotificationAsRead,
    markAllNotificationsAsRead,
  };
};
