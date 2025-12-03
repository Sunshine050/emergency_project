// app/hospital/dashboard/hooks/useHospitalDashboard.ts
"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/shared/hooks/use-toast";
import { getAuthHeaders } from "@lib/utils";
import { webSocketClient } from "@lib/websocket";
import { ApiRescueTeam, EmergencyCase } from "@/shared/types";

interface HospitalDashboardStats {
  assigned: number;
  inProgress: number;
  completed: number;
  critical: number;
  total: number;
  beds: {
    total: number;
    occupied: number;
    available: number;
    icu: {
      total: number;
      occupied: number;
      available: number;
    };
  };
  resources: {
    totalStaff: number;
    availableStaff: number;
    totalAmbulances: number;
    availableAmbulances: number;
  };
}

export const useHospitalDashboard = () => {
  const [stats, setStats] = useState<HospitalDashboardStats>({
    assigned: 0,
    inProgress: 0,
    completed: 0,
    critical: 0,
    total: 0,
    beds: {
      total: 0,
      occupied: 0,
      available: 0,
      icu: {
        total: 0,
        occupied: 0,
        available: 0,
      },
    },
    resources: {
      totalStaff: 0,
      availableStaff: 0,
      totalAmbulances: 0,
      availableAmbulances: 0,
    },
  });

  const [cases, setCases] = useState<EmergencyCase[]>([]);
  const [rescueTeams, setRescueTeams] = useState<ApiRescueTeam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchHospitalData = async () => {
    try {
      setLoading(true);
      setError(null);
      const headers = getAuthHeaders();

      let hospitalId: string | null = null;
      let hospitalData: any = null;

      // Try to get hospital ID from user metadata
      try {
        const userResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/me`,
          { headers }
        );

        if (userResponse.ok) {
          const userData = await userResponse.json();
          hospitalId = userData.hospitalId || userData.metadata?.hospitalId;
        }
      } catch (err) {
        console.log("Could not fetch user info, will try alternative methods");
      }

      // If no hospitalId from user, try to get from hospitals list
      if (!hospitalId) {
        try {
          const hospitalsResponse = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/hospitals`,
            { headers }
          );

          if (hospitalsResponse.ok) {
            const hospitals = await hospitalsResponse.json();
            if (hospitals && hospitals.length > 0) {
              // Use the first hospital for this user
              hospitalId = hospitals[0].id;
              hospitalData = hospitals[0];
            }
          }
        } catch (err) {
          console.log("Could not fetch hospitals list");
        }
      }

      // If still no hospital, use mock data for demonstration
      if (!hospitalId) {
        console.warn("No hospital found, using mock data");
        hospitalData = {
          id: "mock-hospital-1",
          name: "Mock Hospital",
          totalBeds: 100,
          availableBeds: 45,
          medicalInfo: {
            capacity: {
              icuBeds: 20,
              availableIcuBeds: 8,
            },
            staff: {
              total: 50,
              available: 35,
            },
            ambulances: {
              total: 10,
              available: 6,
            },
          },
        };
      } else if (!hospitalData) {
        // Fetch hospital profile if we have ID but no data yet
        const hospitalResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/hospitals/${hospitalId}`,
          { headers }
        );

        if (hospitalResponse.ok) {
          hospitalData = await hospitalResponse.json();
        } else {
          throw new Error("Failed to fetch hospital profile");
        }
      }

      // Fetch assigned cases for this hospital
      // Note: Hospital role doesn't have access to /sos endpoint (403 Forbidden)
      // In production, there should be a dedicated endpoint like /hospitals/{id}/cases
      let casesData: EmergencyCase[] = [];
      
      // Temporarily disabled - waiting for proper hospital cases endpoint
      /*
      if (hospitalId && hospitalId !== "mock-hospital-1") {
        try {
          const casesResponse = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/sos`,
            { headers }
          );

          if (casesResponse.ok) {
            const allCases = await casesResponse.json();
            // Filter cases assigned to this hospital
            casesData = allCases.filter((c: any) => 
              c.hospitalId === hospitalId || 
              c.assignedHospitalId === hospitalId ||
              c.hospital?.id === hospitalId
            );
          }
        } catch (err) {
          console.log("Could not fetch cases, using empty array");
        }
      }
      */

      setCases(casesData);

      // Calculate stats from cases
      const assignedCount = casesData.filter((c: EmergencyCase) => c.status === "assigned").length;
      const inProgressCount = casesData.filter((c: EmergencyCase) => c.status === "in-progress").length;
      const completedCount = casesData.filter((c: EmergencyCase) => c.status === "completed").length;
      const criticalCount = casesData.filter((c: EmergencyCase) => c.severity >= 3).length;

      // Get bed information from hospital data
      const totalBeds = hospitalData.totalBeds || 0;
      const availableBeds = hospitalData.availableBeds || 0;
      const icuTotal = hospitalData.medicalInfo?.capacity?.icuBeds || 0;
      const icuAvailable = hospitalData.medicalInfo?.capacity?.availableIcuBeds || 0;

      setStats({
        assigned: assignedCount,
        inProgress: inProgressCount,
        completed: completedCount,
        critical: criticalCount,
        total: casesData.length,
        beds: {
          total: totalBeds,
          occupied: totalBeds - availableBeds,
          available: availableBeds,
          icu: {
            total: icuTotal,
            occupied: icuTotal - icuAvailable,
            available: icuAvailable,
          },
        },
        resources: {
          totalStaff: hospitalData.medicalInfo?.staff?.total || 0,
          availableStaff: hospitalData.medicalInfo?.staff?.available || 0,
          totalAmbulances: hospitalData.medicalInfo?.ambulances?.total || 0,
          availableAmbulances: hospitalData.medicalInfo?.ambulances?.available || 0,
        },
      });

      // Fetch rescue teams
      try {
        const teamsResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/rescue-teams`,
          { headers }
        );

        if (teamsResponse.ok) {
          const teamsData = await teamsResponse.json();
          setRescueTeams(teamsData);
        }
      } catch (err) {
        console.error("Error fetching rescue teams:", err);
        // Don't fail the whole dashboard if rescue teams fail
      }

    } catch (err: any) {
      console.error("Error fetching hospital dashboard data:", err);
      setError(err.message || "Failed to load dashboard data");
      toast({
        title: "ข้อผิดพลาด",
        description: "ไม่สามารถโหลดข้อมูลแดชบอร์ดได้",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      toast({
        title: "ข้อผิดพลาด",
        description: "กรุณาเข้าสู่ระบบเพื่อใช้งาน",
        variant: "destructive",
      });
      window.location.href = "/login";
      return;
    }

    fetchHospitalData();

    // Setup WebSocket for real-time updates
    const connectWebSocket = () => {
      webSocketClient.connect(token);
      webSocketClient.onStatusUpdate((data) => {
        console.log("Received status update:", data);
        fetchHospitalData();
      });
      webSocketClient.on("notification", (data) => {
        console.log("Received notification:", data);
        toast({
          title: data.title || "การแจ้งเตือน",
          description: data.body || "มีข้อความแจ้งเตือนใหม่",
        });
      });
      webSocketClient.onEmergency((data) => {
        console.log("Received new emergency:", data);
        fetchHospitalData();
      });
    };

    connectWebSocket();

    return () => {
      webSocketClient.disconnect();
    };
  }, [toast]);

  return {
    stats,
    cases,
    rescueTeams,
    loading,
    error,
    refetch: fetchHospitalData,
  };
};
