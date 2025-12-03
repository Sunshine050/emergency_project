// app/1669/hospitals/hooks/useHospitals.ts
import { useState, useEffect, useMemo } from "react";
import { useToast } from "@/shared/hooks/use-toast";
import { fetchHospitals, updateHospitalStatus } from "@/shared/services/hospitalService";
import { getAllEmergencyRequests } from "@/shared/services/emergencyService";
import { statusColors, getCaseStatusLabel } from "@/shared/utils/statusUtils";
import { Hospital, EmergencyCase } from "@/shared/types";
import { webSocketClient } from "@lib/websocket";

// ✅ import enum ให้ใช้ตรงจาก hospitalService
import { HospitalStatus } from "@/shared/services/hospitalService";

export const useHospitals = () => {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [cases, setCases] = useState<EmergencyCase[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchData = async () => {
    try {
      setLoading(true);
      const [hospitalsData, casesData] = await Promise.all([
        fetchHospitals(),
        getAllEmergencyRequests()
      ]);
      setHospitals(hospitalsData);
      setCases(casesData);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "ข้อผิดพลาด",
        description: "ไม่สามารถดึงข้อมูลได้ กรุณาลองใหม่",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (hospitalId: string) => {
    try {
      setUpdatingId(hospitalId);
      const hospital = hospitals.find((h) => h.id === hospitalId);
      if (!hospital) return;

      // ✅ ใช้ enum HospitalStatus แทน string
      const newStatus =
        hospital.status === HospitalStatus.ACTIVE
          ? HospitalStatus.MAINTENANCE // หรือ BUSY ถ้ามีใน enum
          : HospitalStatus.ACTIVE;

      await updateHospitalStatus(hospitalId, newStatus);

      setHospitals((prev) =>
        prev.map((h) =>
          h.id === hospitalId ? { ...h, status: newStatus } : h
        )
      );

      toast({
        title: "อัปเดตสถานะสำเร็จ",
        description: `สถานะโรงพยาบาล ${hospital.name} เปลี่ยนเป็น ${
          newStatus === HospitalStatus.ACTIVE ? "ใช้งานได้" : "อยู่ระหว่างบำรุงรักษา"
        }`,
      });
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        title: "ข้อผิดพลาด",
        description: "ไม่สามารถอัปเดตสถานะได้",
        variant: "destructive",
      });
    } finally {
      setUpdatingId(null);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    fetchData();

    webSocketClient.connect(token);
    const handler = (data: any) => {
      console.log("Received hospital update:", data);
      fetchData();
      toast({
        title: "อัปเดตโรงพยาบาล",
        description: `มีการเปลี่ยนแปลงข้อมูลโรงพยาบาล ID: ${data.hospitalId}`,
      });
    };
    webSocketClient.on("hospitalUpdate", handler);

    return () => {
      webSocketClient.off("hospitalUpdate", handler);
      webSocketClient.disconnect();
    };
  }, [toast]);

  const filteredHospitals = useMemo(() => {
    return hospitals.filter((h) => {
      const query = searchQuery.toLowerCase();
      const nameMatch = h.name.toLowerCase().includes(query);
      const addressMatch = (h.address ?? "").toLowerCase().includes(query);
      const cityMatch = h.city ? h.city.toLowerCase().includes(query) : false;
      const phoneMatch = h.contactPhone ? h.contactPhone.includes(query) : false;
      return nameMatch || addressMatch || cityMatch || phoneMatch;
    });
  }, [hospitals, searchQuery]);

  const stats = useMemo(() => {
    const totalHospitals = hospitals.length;
    
    // Calculate totals
    const totalBeds = hospitals.reduce((sum, h) => sum + (h.medicalInfo?.capacity?.totalBeds || 0), 0);
    const totalAvailable = hospitals.reduce((sum, h) => sum + (h.availableBeds || h.medicalInfo?.capacity?.availableBeds || 0), 0);
    
    // Calculate occupancy
    const bedOccupancy = totalBeds > 0 
      ? Math.round(((totalBeds - totalAvailable) / totalBeds) * 100) 
      : 0;

    // Calculate case stats
    // Note: We are using real data here. If fields are missing in the API, they will be 0.
    // We do not mock data.
    
    const totalPatients = cases.length; // Assuming 1 case = 1 patient
    const emergencyCases = cases.filter(c => c.grade === 'CRITICAL' || c.grade === 'URGENT').length;
    
    // Response time calculation (if available)
    // Assuming reportedAt is available, but we need a "respondedAt" or similar to calculate.
    // Since we don't have explicit response timestamps in the basic type, we'll set to 0 for now
    // or try to infer if there's a 'history' or 'logs' field (not visible in current types).
    const avgResponseTime = 0; 

    // These metrics require specific hospital operational data which is currently not in the Hospital model.
    // Setting to 0 to reflect actual data availability.
    const avgWaitTime = 0;
    const satisfaction = 0;
    const staffUtilization = 0;

    return {
      avgWaitTime,
      bedOccupancy,
      satisfaction,
      staffUtilization,
      totalPatients,
      emergencyCases,
      avgResponseTime,
      
      // Keep original stats for other components if needed
      totalHospitals,
      totalAvailableBeds: totalAvailable,
      activeHospitals: hospitals.filter((h) => h.status === HospitalStatus.ACTIVE).length,
    };
  }, [hospitals, cases]);

  const handleContactHospital = (hospital: Hospital) => {
    if (hospital.contactPhone) {
      window.open(`tel:${hospital.contactPhone}`, "_blank");
    } else if (hospital.contactEmail) {
      window.open(
        `mailto:${hospital.contactEmail}?subject=Emergency Coordination - ${hospital.name}`,
        "_blank"
      );
    } else {
      toast({
        title: "ไม่พบข้อมูลติดต่อ",
        description: "กรุณาตรวจสอบข้อมูลโรงพยาบาล",
        variant: "destructive",
      });
    }
  };

  return {
    hospitals: filteredHospitals,
    stats,
    loading,
    updatingId,
    searchQuery,
    setSearchQuery,
    handleUpdateStatus,
    handleContactHospital,
    statusColors,
    getCaseStatusLabel,
    cases,
    refetch: fetchData,
  };
};
