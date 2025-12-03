import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getAuthHeaders = () => {
  const token = localStorage.getItem("access_token");
  if (!token) throw new Error("ไม่พบ access token");
  return { Authorization: `Bearer ${token}` };
};

// app/shared/types.ts
// Add to existing (from cases/dashboard)
export interface Hospital {
  id: string;
  name: string;
  type: string;
  address: string;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  latitude: number | null;
  longitude: number | null;
  contactPhone: string;
  contactEmail: string | null;
  status: "ACTIVE" | "INACTIVE" | "BUSY" | string;
  medicalInfo: any | null;
  createdAt: string;
  updatedAt: string;
  availableBeds: number | null;
}

// ... existing