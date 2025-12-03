// app/hospital/cases/hooks/useHospitalCases.ts
import { useState, useEffect, useMemo } from "react";
import { useToast } from "@/shared/hooks/use-toast";
import { EmergencyCase } from "@/shared/types";
import {
  fetchActiveEmergencies,
  transferCase,
} from "@/shared/services/emergencyService";

export interface MapLocation {
  id: string;
  title: string;
  severity: number;
  coordinates: { lat: number; lng: number };
  address: string;
  description: string;
  patientName: string;
  status: string;
}

export const useHospitalCases = () => {
  const [cases, setCases] = useState<EmergencyCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [filters, setFilters] = useState({
    status: "all",
    severity: "all",
    date: "all",
  });
  const { toast } = useToast();

  useEffect(() => {
    const loadCases = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchActiveEmergencies();
        setCases(data);
      } catch (err: any) {
        setError(err.message || "ไม่สามารถโหลดข้อมูลเคสได้");
        toast({
          title: "โหลดข้อมูลล้มเหลว",
          description: err.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadCases();
  }, [toast]);

  const filteredCases = useMemo(() => {
    return cases.filter((c) => {
      const matchesSearch =
        c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.patientName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.emergencyType || "").toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = filters.status === "all" || c.status === filters.status;
      const matchesSeverity =
        filters.severity === "all" || c.severity.toString() === filters.severity;
      const matchesDate = filters.date === "all";

      return matchesSearch && matchesStatus && matchesSeverity && matchesDate;
    });
  }, [cases, searchQuery, filters]);

  const handleTransferCase = async (caseId: string, teamId: string, teamName: string) => {
    try {
      await transferCase(caseId, teamName);
      setCases((prev) =>
        prev.map((c) =>
          c.id === caseId
            ? { ...c, status: "in-progress", assignedTo: teamName }
            : c
        )
      );
      toast({
        title: "มอบหมายเคสสำเร็จ",
        description: `เคส ${caseId.slice(0, 8)} ถูกส่งไปยัง ${teamName}`,
      });
    } catch (err: any) {
      toast({
        title: "มอบหมายเคสล้มเหลว",
        description: err.message,
        variant: "destructive",
      });
      throw err; // Re-throw so dialog can handle it
    }
  };

  const getMapLocations = useMemo((): MapLocation[] => {
    return filteredCases
      .filter((c) => c.location?.coordinates)
      .map((c) => ({
        id: c.id,
        title: c.description,
        severity: c.severity,
        coordinates: {
          lat: c.location.coordinates.lat,
          lng: c.location.coordinates.lng,
        },
        address: c.location.address,
        description: c.descriptionFull || c.description,
        patientName: c.patientName || "ไม่ระบุชื่อ",
        status: c.status,
      }));
  }, [filteredCases]);

  const refetch = async () => {
    try {
      setLoading(true);
      const data = await fetchActiveEmergencies();
      setCases(data);
    } catch (err: any) {
      toast({
        title: "รีเฟรชล้มเหลว",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    cases: filteredCases,
    allCases: cases,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    viewMode,
    setViewMode,
    filters,
    setFilters,
    handleTransferCase,
    getMapLocations,
    refetch,
  };
};