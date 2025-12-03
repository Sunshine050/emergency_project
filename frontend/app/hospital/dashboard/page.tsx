"use client";

import DashboardLayout from "@components/dashboard/dashboard-layout";
import { useHospitalDashboard } from "./hooks/useHospitalDashboard";
import { HospitalDashboardCards } from "./components/HospitalDashboardCards";
import { Calendar, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function HospitalDashboard() {
  const { stats, rescueTeams, error, loading } = useHospitalDashboard();

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

  if (loading) {
    return (
      <DashboardLayout
        role="hospital"
        notifications={[]}
        unreadCount={0}
        onMarkAsRead={() => {}}
        onMarkAllAsRead={() => {}}
      >
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-slate-600 dark:text-slate-400">กำลังโหลดข้อมูลแดชบอร์ด...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      role="hospital"
      notifications={[]}
      unreadCount={0}
      onMarkAsRead={() => {}}
      onMarkAllAsRead={() => {}}
    >
      <motion.div 
        className="flex flex-col h-[calc(100vh-4rem)] max-w-[1800px] mx-auto overflow-hidden p-4 gap-3"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header Section */}
        <motion.div variants={itemVariants} className="flex-none flex flex-col md:flex-row justify-between items-start md:items-center gap-3 bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
              Hospital Dashboard
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 flex items-center gap-2">
              <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              Real-time Hospital Management
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

        {/* Stats Cards */}
        <motion.div variants={itemVariants} className="flex-1 min-h-0 overflow-hidden">
          <HospitalDashboardCards stats={stats} rescueTeams={rescueTeams} error={error} />
        </motion.div>

        {/* Footer */}
        <motion.div variants={itemVariants} className="flex-none text-center text-xs text-slate-400 dark:text-slate-500 py-1">
          <p>Hospital Management System © 2025 • Real-time Analytics Dashboard</p>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
}
