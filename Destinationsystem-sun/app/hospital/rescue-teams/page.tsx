"use client";

import React from "react";
import { useRescueTeams } from "./hooks/useRescueTeams";
import { useAuth } from "@/shared/hooks/useAuth";
import { useNotifications } from "@/shared/hooks/useNotifications";
import DashboardLayout from "@components/dashboard/dashboard-layout";
import { Input } from "@components/ui/input";
import { Search } from "lucide-react";
import { Button } from "@components/ui/button";
import { RescueTeamCard } from "./components/RescueTeamCard";
import { RescueTeamsStatsCards } from "./components/RescueTeamsStatsCards";

export default function RescueTeamsPage() {
  useAuth(); // ตรวจสอบสิทธิ์ก่อนใช้งาน
  const { notifications } = useNotifications();

  const {
    teams: filteredTeams,
    stats,
    searchQuery,
    setSearchQuery,
    isLoading,
    error,
  } = useRescueTeams();

  // ถ้าจะเพิ่มฟังก์ชัน Contact All Teams
  const handleContactAll = () => {
    // TODO: implement contact all teams logic here
    alert("Contact all teams feature coming soon!");
  };

  return (
    <DashboardLayout
      role="hospital"
      notifications={notifications}
      unreadCount={0}
      onMarkAsRead={() => {}}
      onMarkAllAsRead={() => {}}
    >
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">Rescue Teams</h1>
            <p className="text-slate-500 dark:text-slate-400">
              Monitor and coordinate with rescue teams
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleContactAll}>Contact All Teams</Button>
          </div>
        </div>

        <RescueTeamsStatsCards stats={stats} />

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
            <Input
              type="search"
              placeholder="Search teams..."
              className="pl-8"
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setSearchQuery(e.target.value)
              }
            />
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">ไม่สามารถโหลดข้อมูลทีมกู้ภัย</h3>
                <p className="mt-1 text-sm text-red-700 dark:text-red-300">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* Teams List */}
        {!isLoading && !error && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredTeams.length === 0 ? (
              <div className="col-span-2 text-center py-12">
                <p className="text-slate-500 dark:text-slate-400">ไม่พบข้อมูลทีมกู้ภัย</p>
              </div>
            ) : (
              filteredTeams.map((team) => (
                <RescueTeamCard key={team.id} team={team} />
              ))
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
