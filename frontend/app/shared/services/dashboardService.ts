// app/shared/services/dashboardService.ts
// API for dashboard (stats, emergencies, locations, capacities, assign/cancel case)

import { getAuthHeaders } from "@lib/utils";

// Define DTO types ที่ match กับ backend DTO (จาก dashboard.dto.ts)
interface DashboardStatsResponseDto {
  totalEmergencies: number;
  activeEmergencies: number;
  completedEmergencies: number;
  cancelledEmergencies: number;
  averageResponseTime: number;
  activeTeams: number;
  availableHospitalBeds: number;
  connectedHospitals: number;
  criticalCases: number;
}

interface EmergencyCaseDto {
  id: string;
  title: string;
  status: string;
  severity: number;
  reportedAt: string;
  patientName: string;
  contactNumber: string;
  emergencyType: string;
  location: {
    address: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  assignedTo?: string;
  description: string;
  symptoms: string[];
}

interface AssignCaseDto {
  caseId: string;
  assignedToId: string;
}

interface CancelCaseDto {
  caseId: string;
}

// สมมติ DashboardStats ใน shared/types match DashboardStatsResponseDto
type DashboardStats = DashboardStatsResponseDto;

// Function เดิม (match ตรง ไม่ต้องปรับ)
export const fetchDashboardStats = async (): Promise<DashboardStats> => {
  const headers = getAuthHeaders();
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/dashboard/stats`, {
    headers,
  });
  if (!response.ok) throw new Error(`Failed to fetch stats: ${response.statusText}`);
  return response.json();
};

// Functions ใหม่สำหรับ endpoints อื่น ๆ (ปรับ type ให้ match DTO)
export const fetchActiveEmergencies = async (): Promise<EmergencyCaseDto[]> => {
  const headers = getAuthHeaders();
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/dashboard/active-emergencies`, {
    headers,
  });
  if (!response.ok) throw new Error(`Failed to fetch active emergencies: ${response.statusText}`);
  return response.json();
};

export const fetchTeamLocations = async (): Promise<any[]> => {  // ปรับ type ถ้ามี Location type ใน shared/types
  const headers = getAuthHeaders();
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/dashboard/team-locations`, {
    headers,
  });
  if (!response.ok) throw new Error(`Failed to fetch team locations: ${response.statusText}`);
  return response.json();
};

export const fetchHospitalCapacities = async (): Promise<any[]> => {  // ปรับ type ถ้ามี HospitalCapacity type
  const headers = getAuthHeaders();
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/dashboard/hospital-capacities`, {
    headers,
  });
  if (!response.ok) throw new Error(`Failed to fetch hospital capacities: ${response.statusText}`);
  return response.json();
};

export const assignCase = async (data: AssignCaseDto): Promise<any> => {
  const headers = getAuthHeaders();
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/dashboard/assign-case`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error(`Failed to assign case: ${response.statusText}`);
  return response.json();
};

export const cancelCase = async (data: CancelCaseDto): Promise<any> => {
  const headers = getAuthHeaders();
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/dashboard/cancel-case`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error(`Failed to cancel case: ${response.statusText}`);
  return response.json();
};