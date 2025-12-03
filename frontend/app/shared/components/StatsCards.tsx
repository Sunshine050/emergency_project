// app/shared/components/StatsCards.tsx
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card";
import { Activity, Clock, AlertTriangle, Hospital, Building2, Bed, Users, CheckCircle, FileText } from "lucide-react";
import { DashboardStats } from "@/shared/types";
import { Badge } from "@components/ui/badge";

// ==============================
// 📊 DASHBOARD STATS CARDS
// ==============================
interface StatsCardsProps {
  stats: DashboardStats | null;
  criticalCases?: number;
}

export const StatsCards: React.FC<StatsCardsProps> = ({ stats, criticalCases = 0 }) => {
  if (!stats) {
    return <div>Loading...</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Admissions */}
      <Card className="border-l-4 border-l-blue-500 bg-gradient-to-br from-blue-50 to-white dark:from-blue-950 dark:to-slate-900">
        <CardContent className="p-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">All Admissions</p>
              <h3 className="text-3xl font-bold">{stats.totalEmergencies}</h3>
              <div className="mt-2 space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Active Cases:</span>
                  <span className="font-semibold">{stats.activeEmergencies}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Completed:</span>
                  <span className="font-semibold">{stats.completedEmergencies}</span>
                </div>
              </div>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Activity className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Critical Cases */}
      <Card className="border-l-4 border-l-amber-500 bg-gradient-to-br from-amber-50 to-white dark:from-amber-950 dark:to-slate-900">
        <CardContent className="p-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Critical Cases</p>
              <h3 className="text-3xl font-bold">{stats.criticalCases}</h3>
              <div className="mt-2 space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Avg Response Time:</span>
                  <span className="font-semibold">{stats.averageResponseTime.toFixed(1)} min</span>
                </div>
              </div>
            </div>
            <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
              <Clock className="h-6 w-6 text-amber-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Inpatient (critical cases display) */}
      <Card className="border-l-4 border-l-red-500 bg-gradient-to-br from-red-50 to-white dark:from-red-950 dark:to-slate-900">
        <CardContent className="p-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Inpatient</p>
              <h3 className="text-3xl font-bold">{criticalCases}</h3>
              <div className="mt-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Total Cases:</span>
                  <span className="font-semibold">{stats.totalEmergencies}</span>
                </div>
              </div>
            </div>
            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Connected Hospitals */}
      <Card className="border-l-4 border-l-green-500 bg-gradient-to-br from-green-50 to-white dark:from-green-950 dark:to-slate-900">
        <CardContent className="p-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Connected Hospitals</p>
              <h3 className="text-3xl font-bold">{stats.connectedHospitals}</h3>
              <div className="mt-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Available Beds:</span>
                  <span className="font-semibold">{stats.availableHospitalBeds}</span>
                </div>
              </div>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <Hospital className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// ==============================
// 🏥 HOSPITAL STATS SUMMARY (ชื่อใหม่ HospitalStatusCards)
// ==============================
export const HospitalStatusCards = ({ stats }: { stats: { total: number; assigned: number; critical: number; inProgress: number; }; }) => (
  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
    <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total</p>
        <Badge className="bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200">{stats.total}</Badge>
      </div>
    </div>
    <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Assigned</p>
        <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-500">{stats.assigned}</Badge>
      </div>
    </div>
    <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Critical</p>
        <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-500">{stats.critical}</Badge>
      </div>
    </div>
    <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">In Progress</p>
        <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-500">{stats.inProgress}</Badge>
      </div>
    </div>
  </div>
);
