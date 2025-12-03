// app/shared/utils/statusUtils.ts
import { cn } from "@lib/utils";

// ==============================
// 🚨 CASE STATUS COLORS
// ==============================
export const statusColors: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  assigned: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  "in-progress": "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400",
  completed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

// ==============================
// ⚠️ SEVERITY LEVEL COLORS
// ==============================
export const severityColors: Record<number, string> = {
  1: "bg-green-500 hover:bg-green-500/80",
  2: "bg-yellow-500 hover:bg-yellow-500/80",
  3: "bg-orange-500 hover:bg-orange-500/80",
  4: "bg-red-500 hover:bg-red-500/80",
};

// ==============================
// 📋 CASE STATUS LABELS
// ==============================
export const getCaseStatusLabel = (status: string): string => {
  switch (status) {
    case "pending": return "รอการดำเนินการ";
    case "assigned": return "มอบหมายแล้ว";
    case "in-progress": return "กำลังดำเนินการ";
    case "completed": return "เสร็จสิ้น";
    case "cancelled": return "ยกเลิก";
    default: return status;
  }
};

// ==============================
// 🏥 UNIT STATUS COLORS & LABELS
// ==============================
export const getUnitStatusColor = (status: string): string => {
  switch (status.toUpperCase()) {
    case "ACTIVE": return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500 border-green-200";
    case "BUSY": return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-500 border-orange-200";
    case "AVAILABLE": return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-500 border-blue-200";
    case "INACTIVE": return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-500 border-gray-200";
    default: return "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400 border-slate-200";
  }
};

export const getUnitStatusLabel = (status: string): string => {
  switch (status.toUpperCase()) {
    case "ACTIVE": return "ใช้งานได้";
    case "BUSY": return "ยุ่ง";
    case "AVAILABLE": return "พร้อมรับ";
    case "INACTIVE": return "ไม่ใช้งาน";
    default: return status;
  }
};


export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'available': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500';
    case 'on-mission': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
    case 'standby': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
    case 'offline': return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400';
    // Existing cases (ACTIVE/BUSY for hospitals, pending/assigned for emergencies)...
    default: return 'bg-slate-100 text-slate-800';
  }
};

export const getStatusLabel = (status: string): string => {
  switch (status) {
    case 'available': return 'Available';
    case 'on-mission': return 'On Mission';
    case 'standby': return 'On Standby';
    case 'offline': return 'Offline';
    // Existing labels...
    default: return status;
  }
};