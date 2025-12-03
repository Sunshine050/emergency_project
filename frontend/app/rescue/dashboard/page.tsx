"use client";

import dynamic from "next/dynamic";

import DashboardLayout from "@components/dashboard/dashboard-layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@components/ui/tabs";
import { Badge } from "@components/ui/badge";
import { MapPin } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@components/ui/card";

import RescueTrendCharts from "./components/RescueTrendCharts";
// import RescueMap from "./components/RescueMap";  // ลบการ import แบบปกติ

import CaseCard from "@components/dashboard/case-card";
import { useRescueDashboard } from "./hooks/useRescueDashboard";
import { useNotifications } from "../../useNotifications";
import { fetchHospitals } from "@/shared/services/hospitalService";

const RescueMap = dynamic(
  () => import("./components/RescueMap").then((mod) => mod.RescueMap),
  { ssr: false }
);

export default function RescueTeamDashboard() {
  const {
    filteredCases,
    handleCompleteCase,
    handleCancelCase,
    stats,
    setCases,
    rescueTeams,
  } = useRescueDashboard();

  const { notifications, unreadCount, markAsRead, markAllAsRead } =
    useNotifications();

  return (
    <DashboardLayout
      role="rescue"
      notifications={notifications}
      unreadCount={unreadCount}
      onMarkAsRead={markAsRead}
      onMarkAllAsRead={markAllAsRead}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">Rescue Team Dashboard</h1>
            <p className="text-slate-500 dark:text-slate-400">
              Manage and track rescue missions
            </p>
          </div>
        </div>

        {/* Stats */}
        <RescueTrendCharts stats={stats} />

        {/* Team Status */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="h-full flex flex-col">
              <CardHeader>
                <CardTitle>Real-Time Operations Map</CardTitle>
                <CardDescription>
                  Live tracking of rescue teams and active emergencies
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 min-h-[400px] p-0 relative overflow-hidden rounded-b-xl">
                <RescueMap
                  cases={filteredCases}
                  rescueTeams={rescueTeams}
                  className="h-full w-full absolute inset-0"
                />
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1 h-full">
            {/* Active Teams List */}
            <Card className="h-full flex flex-col">
              <CardHeader>
                <CardTitle>Active Teams</CardTitle>
                <CardDescription>Teams currently on mission</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto pr-2">
                <div className="space-y-4">
                  {rescueTeams.filter((t) => t.status !== "AVAILABLE").length ===
                  0 ? (
                    <p className="text-sm text-slate-500 text-center py-4">
                      ไม่มีทีมที่กำลังทำงาน
                    </p>
                  ) : (
                    rescueTeams
                      .filter((t) => t.status !== "AVAILABLE")
                      .map((team) => {
                        const activeCase = filteredCases.find(
                          (c) =>
                            c.assignedTo === team.id ||
                            team.medicalInfo?.currentEmergencyId === c.id
                        );
                        const isWorking =
                          team.status === "BUSY" || team.status === "ACTIVE";

                        return (
                          <div
                            key={team.id}
                            className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-semibold text-sm">{team.name}</h4>
                              <Badge
                                variant={isWorking ? "secondary" : "outline"}
                                className={`text-[10px] ${
                                  isWorking ? "bg-slate-400 text-white" : ""
                                }`}
                              >
                                {isWorking ? "กำลังทำงาน" : team.status}
                              </Badge>
                            </div>

                            {activeCase ? (
                              <div className="space-y-1">
                                <p className="text-xs text-slate-500">
                                  กำลังจัดการ:{" "}
                                  <span className="font-medium text-slate-700 dark:text-slate-300">
                                    {activeCase.emergencyType}
                                  </span>
                                </p>
                                <p className="text-xs text-slate-500">
                                  ผู้ป่วย: {activeCase.patientName}
                                </p>
                                <div className="mt-2 flex items-center gap-2">
                                  <div className="h-1.5 flex-1 bg-slate-200 rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-blue-500 rounded-full"
                                      style={{
                                        width:
                                          activeCase.status === "in-progress"
                                            ? "60%"
                                            : "100%",
                                      }}
                                    />
                                  </div>
                                  <span className="text-[10px] font-medium text-blue-600">
                                    {activeCase.status === "in-progress"
                                      ? "กำลังเดินทาง"
                                      : activeCase.status}
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <p className="text-xs text-slate-400 italic">
                                ไม่มีเคสที่เชื่อมโยง
                              </p>
                            )}
                          </div>
                        );
                      })
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Missions List */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Rescue Missions</h2>

          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">All Missions</TabsTrigger>
              <TabsTrigger value="in-progress">
                Active <Badge className="ml-1">{stats.inProgress}</Badge>
              </TabsTrigger>
              <TabsTrigger value="completed">
                Completed <Badge className="ml-1">{stats.completed}</Badge>
              </TabsTrigger>
            </TabsList>

            {["all", "in-progress", "completed"].map((tab) => (
              <TabsContent key={tab} value={tab} className="space-y-4">
                {filteredCases.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-slate-500 dark:text-slate-400">
                      No missions found
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {filteredCases
                      .filter((c) => tab === "all" || c.status === tab)
                      .map((c) => (
                        <CaseCard
                          key={c.id}
                          id={c.id}
                          description={c.description}
                          descriptionFull={c.descriptionFull}
                          status={c.status}
                          grade={c.grade}
                          severity={c.severity}
                          onCancel={() => handleCancelCase(c.id)}
                          onTransfer={() => handleCompleteCase(c.id)}
                          reportedAt={c.reportedAt}
                          patientName={c.patientName}
                          contactNumber={c.contactNumber}
                          emergencyType={c.emergencyType}
                          location={c.location}
                          assignedTo={c.assignedTo}
                          symptoms={c.symptoms}
                          role="rescue"
                          setCases={setCases}
                          fetchHospitals={fetchHospitals}
                        />
                      ))}
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>
    </DashboardLayout>
  );
}
