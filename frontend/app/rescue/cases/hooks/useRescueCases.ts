import { useState, useEffect } from 'react';
import { useToast } from '@/shared/hooks/use-toast';
import { 
  fetchRescueAssignedCases, 
  updateEmergencyStatus, 
  cancelCase 
} from '@/shared/services/emergencyService';

import { EmergencyRequestFromApi } from '@/shared/types';

// -------------------------------
// Local Type (for frontend UI)
// -------------------------------
export type EmergencyCase = {
  id: string;
  title: string;
  status: 'pending' | 'assigned' | 'in-progress' | 'completed' | 'cancelled';
  severity: 1 | 2 | 3 | 4;
  reportedAt: string;
  patientName: string;
  contactNumber: string;
  emergencyType: string;
  location: {
    address: string;
    coordinates: { lat: number; lng: number };
  };
  assignedTo: string;
  description: string;
  symptoms: string[];
};

// -------------------------------
// Convert API → UI format
// -------------------------------
const convertApiCase = (apiCase: EmergencyRequestFromApi): EmergencyCase => {
  return {
    id: apiCase.id,
    title: `${apiCase.emergencyType || "Emergency"} - ${apiCase.patient?.firstName || ""}`,
    status: apiCase.status as EmergencyCase["status"],
    severity: Number(apiCase.medicalInfo?.grade || 4) as 1 | 2 | 3 | 4,
    reportedAt: apiCase.createdAt,
    patientName: `${apiCase.patient?.firstName || ""} ${apiCase.patient?.lastName || ""}`.trim(),
    contactNumber: apiCase.patient?.phone || "-",
    emergencyType: apiCase.emergencyType || "Unknown",
    location: {
      address: apiCase.location || "Unknown",
      coordinates: {
        lat: apiCase.latitude || 0,
        lng: apiCase.longitude || 0,
      },
    },
    assignedTo: apiCase.responses?.[0]?.organization?.name || "Unassigned",
    description: apiCase.description || "",
    symptoms: Array.isArray(apiCase.medicalInfo?.symptoms)
      ? apiCase.medicalInfo.symptoms
      : apiCase.medicalInfo?.symptoms
      ? [apiCase.medicalInfo.symptoms]
      : [],
  };
};

// -------------------------------
// Hook
// -------------------------------
export const useRescueCases = () => {
  const [cases, setCases] = useState<EmergencyCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Load from API (REAL)
  useEffect(() => {
    const loadCases = async () => {
      try {
        setLoading(true);

        const apiCases: EmergencyRequestFromApi[] = await fetchRescueAssignedCases();
        const rescueCases = apiCases.map(convertApiCase);

        setCases(rescueCases);
        setError(null);

      } catch (err: any) {
        console.error("Failed to load rescue cases:", err);

        const message =
          err?.response?.data?.message ||
          err.message ||
          "Failed to load assigned cases";

        if (message.includes("organizationId")) {
          setError("User ยังไม่ได้ถูกผูกกับทีมกู้ภัย");
        } else {
          setError(message);
        }

        toast({
          title: "โหลดข้อมูลล้มเหลว",
          description: "ไม่สามารถดึงข้อมูลเคสได้ กรุณาติดต่อ Admin",
          variant: "destructive",
        });

        setCases([]); 
      } finally {
        setLoading(false);
      }
    };

    loadCases();
  }, []);

  // ---------------------------
  // COMPLETE CASE
  // ---------------------------
  const handleCompleteCase = async (caseId: string) => {
    try {
      await updateEmergencyStatus(caseId, { status: "COMPLETED" });

      setCases(prev =>
        prev.map(c =>
          c.id === caseId ? { ...c, status: "completed" } : c
        )
      );

      toast({
        title: "Mission Completed",
        description: `Case ${caseId} marked as completed`,
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to complete mission",
        variant: "destructive",
      });
    }
  };

  // ---------------------------
  // CANCEL CASE
  // ---------------------------
  const handleCancelCase = async (caseId: string) => {
    try {
      await cancelCase(caseId);

      setCases(prev =>
        prev.map(c =>
          c.id === caseId ? { ...c, status: "cancelled" } : c
        )
      );

      toast({
        title: "Mission Cancelled",
        description: `Case ${caseId} has been cancelled.`,
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to cancel mission",
        variant: "destructive",
      });
    }
  };

  return {
    cases,
    loading,
    error,
    handleCompleteCase,
    handleCancelCase,
  };
};
