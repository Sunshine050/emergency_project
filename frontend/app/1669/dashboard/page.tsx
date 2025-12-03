"use client";

import { useState } from "react";
import DashboardLayout from "@components/dashboard/dashboard-layout";
import { useDashboardData } from "./hooks/useDashboardData";
import { TrendCharts } from "./components/TrendCharts";
import { ModernCaseCard } from "./components/ModernCaseCard";
import { CaseModal } from "./components/CaseModal";
import { StatsCards } from "@/shared/components/StatsCards";
import { Card, CardHeader, CardTitle, CardContent } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Calendar, Activity, Search, Filter } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@components/ui/tabs";
import { Input } from "@components/ui/input";
import { Badge } from "@components/ui/badge";
import { motion } from "framer-motion";

export default function EmergencyCenterDashboard() {
  const {
    stats,
    cases: filteredCases,
    monthlyTrendData,
    selectedPeriod,
    setSelectedPeriod,
    searchQuery,
    setSearchQuery,
    notifications,
    unreadCount,
    pendingCases,
    assignedCases,
    inProgressCases,
    criticalCases,
    handleViewDetails,
    handleMarkAsRead,
    handleMarkAllAsRead,
  } = useDashboardData();

  const [open, setOpen] = useState(false);
  const [selectedCase, setSelectedCase] = useState<any>(null);
  const [tabValue, setTabValue] = useState("all");

  const handleViewCase = (caseData: any) => {
    setSelectedCase(caseData);
    setOpen(true);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  return (
    <DashboardLayout
      role="emergency-center"
      notifications={notifications}
      unreadCount={unreadCount}
      onMarkAsRead={handleMarkAsRead}
      onMarkAllAsRead={handleMarkAllAsRead}
    >
      <motion.div 
        className="space-y-8 max-w-[1800px] mx-auto pb-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header Section */}
        <motion.div variants={itemVariants} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Emergency Command Center
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
              <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              Live Monitoring Dashboard
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 bg-slate-50 dark:bg-slate-800 px-3 py-2 rounded-lg">
              <Calendar className="h-4 w-4 text-slate-500" />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Period Selector */}
        <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-3 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400">
            <Filter className="h-4 w-4" />
            <span>Time Period:</span>
          </div>
          <div className="flex gap-2">
            {[
              { value: '6-months', label: '6 Months' },
              { value: '12-months', label: '12 Months' },
              { value: '24-months', label: '24 Months' }
            ].map((period) => (
              <Button
                key={period.value}
                variant={selectedPeriod === period.value ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedPeriod(period.value)}
                className="transition-all"
              >
                {period.label}
              </Button>
            ))}
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div variants={itemVariants}>
          <StatsCards stats={stats} criticalCases={criticalCases} />
        </motion.div>

        {/* Charts Section */}
        <motion.div variants={itemVariants}>
          <TrendCharts data={monthlyTrendData} period={selectedPeriod} />
        </motion.div>

        {/* Cases Section */}
        <motion.div variants={itemVariants}>
          <Card className="border-slate-200 dark:border-slate-800 shadow-md">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border-b border-slate-200 dark:border-slate-700">
              <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div>
                  <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    Active Cases
                  </CardTitle>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Real-time case management and tracking
                  </p>
                </div>
                <div className="relative w-full sm:w-80">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    type="search"
                    placeholder="Search by ID, location, or status..."
                    className="pl-9 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-700"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-6">
              <Tabs value={tabValue} onValueChange={setTabValue}>
                <TabsList className="mb-6 bg-slate-100 dark:bg-slate-800 p-1">
                  <TabsTrigger value="all" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900">
                    All Cases
                  </TabsTrigger>
                  <TabsTrigger value="pending" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900">
                    Pending <Badge variant="secondary" className="ml-1.5">{pendingCases}</Badge>
                  </TabsTrigger>
                  <TabsTrigger value="assigned" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900">
                    Assigned <Badge variant="secondary" className="ml-1.5">{assignedCases}</Badge>
                  </TabsTrigger>
                  <TabsTrigger value="in-progress" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900">
                    In Progress <Badge variant="secondary" className="ml-1.5">{inProgressCases}</Badge>
                  </TabsTrigger>
                  <TabsTrigger value="completed" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900">
                    Completed <Badge variant="secondary" className="ml-1.5">{stats?.completedEmergencies || 0}</Badge>
                  </TabsTrigger>
                </TabsList>

                {["all", "pending", "assigned", "in-progress", "completed"].map((tab) => (
                  <TabsContent key={tab} value={tab} className="space-y-4 mt-0">
                    {filteredCases.filter((c) => tab === "all" || c.status === tab).length === 0 ? (
                      <div className="text-center py-16 bg-slate-50 dark:bg-slate-900/50 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                        <Activity className="h-16 w-16 mx-auto mb-4 text-slate-300 dark:text-slate-600" />
                        <p className="text-slate-500 dark:text-slate-400 font-medium">No cases found</p>
                        <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
                          {tab === "all" ? "All cases will appear here" : `No ${tab} cases at the moment`}
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                        {filteredCases
                          .filter((c) => tab === "all" || c.status === tab)
                          .map((emergencyCase) => (
                            <ModernCaseCard
                              key={emergencyCase.id}
                              emergencyCase={emergencyCase}
                              role="emergency-center"
                              onViewDetails={() => handleViewCase(emergencyCase)}
                            />
                          ))}
                      </div>
                    )}
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>

        {/* Footer */}
        <motion.div variants={itemVariants} className="text-center text-sm text-slate-400 dark:text-slate-500 pt-4">
          <p>Emergency Response System © 2025 • Real-time Analytics Dashboard</p>
        </motion.div>

        {/* Case Modal */}
        <CaseModal open={open} onOpenChange={setOpen} selectedCase={selectedCase} />
      </motion.div>
    </DashboardLayout>
  );
}
