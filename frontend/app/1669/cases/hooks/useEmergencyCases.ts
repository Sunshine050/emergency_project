// app/1669/cases/hooks/useEmergencyCases.ts
"use client";

import { useState, useEffect, useMemo } from "react";
import { useToast } from "@/shared/hooks/use-toast";
import { useWebSocket } from "../../../shared/hooks/useWebSocket"; // Relative
import { fetchActiveEmergencies, fetchHospitals, assignCase } from "../../../shared/services/emergencyService"; // Relative
import { EmergencyCase, Hospital, FilterState } from "../../../shared/types"; // Relative
import { webSocketClient } from "@lib/websocket";


export const useEmergencyCases = () => {
  const [cases, setCases] = useState<EmergencyCase[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [filters, setFilters] = useState<FilterState>({ status: "all", severity: "all", date: "all" });
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchData = async () => {
    try {
      setLoading(true);
      const [emergenciesData, hospitalsData] = await Promise.all([
        fetchActiveEmergencies(),
        fetchHospitals(),
      ]);
      setCases(emergenciesData);
      setHospitals(hospitalsData);
    } catch (error) {
      console.error("เกิดข้อผิดพลาดขณะดึงข้อมูล:", error);
      toast({ title: "ข้อผิดพลาด", description: "ไม่สามารถดึงข้อมูลได้ กรุณาลองใหม่", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      toast({ title: "ข้อผิดพลาด", description: "กรุณาเข้าสู่ระบบเพื่อใช้งาน", variant: "destructive" });
      window.location.href = "/login";
      return;
    }

    fetchData();

    const connectWebSocket = () => {
      webSocketClient.connect(token);
      webSocketClient.onStatusUpdate((data) => {
        console.log("ได้รับการอัปเดตสถานะ:", data);
        fetchData();
      });
      webSocketClient.on("notification", (data) => {
        console.log("ได้รับการแจ้งเตือน:", data);
        toast({ title: data.title || "การแจ้งเตือน", description: data.body || "มีข้อความแจ้งเตือนใหม่" });
      });
      webSocketClient.onEmergency((data) => {
        console.log("ได้รับเคสฉุกเฉินใหม่:", data);
        fetchData();
      });
    };

    connectWebSocket();

    return () => {
      webSocketClient.disconnect();
    };
  }, [toast]);

  const filteredCases = useMemo(() => {
    return cases.filter((c) => {
      const matchesSearch =
        c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.emergencyType.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = filters.status === "all" || c.status === filters.status;
      const matchesSeverity = filters.severity === "all" || c.severity.toString() === filters.severity;
      let matchesDate = true;
      if (filters.date !== "all") {
        const reportedDate = new Date(c.reportedAt);
        if (isNaN(reportedDate.getTime())) return false;
        const today = new Date();
        if (filters.date === "today") {
          matchesDate = reportedDate.toDateString() === today.toDateString();
        } else if (filters.date === "yesterday") {
          const yesterday = new Date(today);
          yesterday.setDate(today.getDate() - 1);
          matchesDate = reportedDate.toDateString() === yesterday.toDateString();
        } else if (filters.date === "week") {
          const oneWeekAgo = new Date(today);
          oneWeekAgo.setDate(today.getDate() - 7);
          matchesDate = reportedDate >= oneWeekAgo && reportedDate <= today;
        }
      }
      return matchesSearch && matchesStatus && matchesSeverity && matchesDate;
    });
  }, [cases, searchQuery, filters]);

  const handleAssignCase = async (caseId: string, hospitalId: string) => {
    try {
      const result = await assignCase(caseId, hospitalId);
      
      // แสดงข้อความที่มีรายละเอียดการอัปเดตเตียง
      const bedInfo = result.bedUpdate;
      const bedMessage = bedInfo 
        ? `อัปเดต: ${bedInfo.type === 'ICU' ? 'เตียง ICU' : 'เตียงปกติ'} -1 (ระดับความรุนแรง: ${bedInfo.severity})`
        : '';
      
      toast({ 
        title: "มอบหมายเคสสำเร็จ", 
        description: `เคส ${caseId.slice(-8)} ถูกมอบหมายแล้ว${bedMessage ? '\n' + bedMessage : ''}` 
      });
      fetchData();
    } catch (error: any) {
      console.error("เกิดข้อผิดพลาดขณะมอบหมายเคส:", error);
      toast({ title: "ข้อผิดพลาด", description: `ไม่สามารถมอบหมายเคสได้: ${error.message}`, variant: "destructive" });
    }
  };

  return {
    cases: filteredCases,
    hospitals,
    loading,
    filters,
    setFilters,
    searchQuery,
    setSearchQuery,
    handleAssignCase,
    refetch: fetchData,
  };
};