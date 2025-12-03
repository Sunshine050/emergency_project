import { useState, useEffect, useMemo } from "react";
import { useToast } from "@/shared/hooks/use-toast";

// Types
export interface HospitalReport {
  id: string;
  title: string;
  type: "emergency" | "resources" | "patients" | "performance";
  period: string;
  generatedAt: string;
  fileUrl?: string;
  status: "completed" | "generating" | "failed";
}

export interface HospitalStats {
  avgWaitTime: number; // นาที
  bedOccupancy: number; // %
  satisfaction: number; // %
  staffUtilization: number; // %
  totalPatients: number;
  emergencyCases: number;
  avgResponseTime: number; // นาที
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    borderColor?: string;
    backgroundColor?: string;
  }[];
}

export const useHospitalReports = () => {
  const [reports, setReports] = useState<HospitalReport[]>([]);
  const [stats, setStats] = useState<HospitalStats>({
    avgWaitTime: 0,
    bedOccupancy: 0,
    satisfaction: 0,
    staffUtilization: 0,
    totalPatients: 0,
    emergencyCases: 0,
    avgResponseTime: 0,
  });
  const [reportType, setReportType] = useState<string>("all");
  const [timePeriod, setTimePeriod] = useState<string>("month");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Load reports from API
  const loadReports = async () => {
    setIsLoading(true);
    try {
      // TODO: Replace with actual API call
      // const data = await fetchHospitalReports();
      
      // Mock data for now
      const mockReports: HospitalReport[] = [
        {
          id: "1",
          title: "Emergency Department Performance - November 2025",
          type: "emergency",
          period: "November 2025",
          generatedAt: "2025-11-20T10:30:00Z",
          status: "completed",
          fileUrl: "/reports/ed-nov-2025.pdf",
        },
        {
          id: "2",
          title: "Resource Utilization Report - Q4 2025",
          type: "resources",
          period: "Q4 2025",
          generatedAt: "2025-11-15T14:20:00Z",
          status: "completed",
          fileUrl: "/reports/resources-q4-2025.pdf",
        },
        {
          id: "3",
          title: "Patient Satisfaction Survey - October 2025",
          type: "patients",
          period: "October 2025",
          generatedAt: "2025-11-01T09:00:00Z",
          status: "completed",
          fileUrl: "/reports/satisfaction-oct-2025.pdf",
        },
      ];

      setReports(mockReports);
    } catch (error: any) {
      console.error("Error loading reports:", error);
      toast({
        title: "ไม่สามารถโหลดรายงานได้",
        description: error.message || "กรุณาลองใหม่อีกครั้ง",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Load statistics from API
  const loadStats = async () => {
    try {
      // TODO: Replace with actual API call
      // const data = await fetchHospitalStats(timePeriod);
      
      // Mock data for now
      const mockStats: HospitalStats = {
        avgWaitTime: 22,
        bedOccupancy: 85,
        satisfaction: 94,
        staffUtilization: 92,
        totalPatients: 1250,
        emergencyCases: 340,
        avgResponseTime: 8,
      };

      setStats(mockStats);
    } catch (error: any) {
      console.error("Error loading stats:", error);
    }
  };

  useEffect(() => {
    loadReports();
    loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timePeriod]);

  // Generate new report
  const handleGenerateReport = async () => {
    setIsGenerating(true);
    try {
      // TODO: Replace with actual API call
      // const newReport = await generateHospitalReport({ type: reportType, period: timePeriod });
      
      // Mock generation
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      const newReport: HospitalReport = {
        id: Date.now().toString(),
        title: `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report - ${new Date().toLocaleDateString('th-TH', { month: 'long', year: 'numeric' })}`,
        type: reportType as any,
        period: timePeriod,
        generatedAt: new Date().toISOString(),
        status: "completed",
        fileUrl: `/reports/generated-${Date.now()}.pdf`,
      };

      setReports((prev) => [newReport, ...prev]);
      
      toast({
        title: "สร้างรายงานสำเร็จ",
        description: "รายงานของคุณพร้อมใช้งานแล้ว",
      });
    } catch (error: any) {
      toast({
        title: "ไม่สามารถสร้างรายงานได้",
        description: error.message || "กรุณาลองใหม่อีกครั้ง",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Download report
  const handleDownload = async (reportId: string) => {
    const report = reports.find((r) => r.id === reportId);
    if (!report || !report.fileUrl) {
      toast({
        title: "ไม่พบไฟล์รายงาน",
        variant: "destructive",
      });
      return;
    }

    try {
      // TODO: Implement actual download
      toast({
        title: "กำลังดาวน์โหลด...",
        description: report.title,
      });
      
      // Mock download
      window.open(report.fileUrl, "_blank");
    } catch (error: any) {
      toast({
        title: "ไม่สามารถดาวน์โหลดได้",
        description: error.message || "กรุณาลองใหม่อีกครั้ง",
        variant: "destructive",
      });
    }
  };

  // Filter reports
  const filteredReports = useMemo(() => {
    if (reportType === "all") return reports;
    return reports.filter((r) => r.type === reportType);
  }, [reports, reportType]);

  // Generate chart data
  const chartData: ChartData = useMemo(() => {
    // Mock chart data - replace with actual data from API
    return {
      labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      datasets: [
        {
          label: "Emergency Cases",
          data: [45, 52, 38, 65, 48, 42, 55],
          borderColor: "rgb(239, 68, 68)",
          backgroundColor: "rgba(239, 68, 68, 0.1)",
        },
        {
          label: "Bed Occupancy (%)",
          data: [82, 85, 88, 84, 86, 83, 85],
          borderColor: "rgb(59, 130, 246)",
          backgroundColor: "rgba(59, 130, 246, 0.1)",
        },
      ],
    };
  }, [timePeriod]);

  return {
    reports: filteredReports,
    stats,
    reportType,
    setReportType,
    timePeriod,
    setTimePeriod,
    isGenerating,
    isLoading,
    handleGenerateReport,
    handleDownload,
    chartData,
    loadReports,
    loadStats,
  };
};