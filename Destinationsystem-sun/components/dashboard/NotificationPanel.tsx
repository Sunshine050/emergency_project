"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, AlertTriangle, CheckCircle, Clock, Hospital } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
  metadata?: any;
}

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
}

export default function NotificationPanel({
  isOpen,
  onClose,
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
}: NotificationPanelProps) {
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const categorizedNotifications = useMemo(() => {
    const categories: { [key: string]: Notification[] } = {
      emergency: [],
      hospital: [],
      status: [],
      system: [],
    };

    notifications.forEach((notif) => {
      if (notif.type.toLowerCase().includes("emergency")) {
        categories.emergency.push(notif);
      } else if (notif.type.toLowerCase().includes("hospital")) {
        categories.hospital.push(notif);
      } else if (notif.type.toLowerCase().includes("status")) {
        categories.status.push(notif);
      } else if (notif.type.toLowerCase().includes("system")) {
        categories.system.push(notif);
      }
    });

    return categories;
  }, [notifications]);

  const filteredNotifications = useMemo(() => {
    const filterNotifications = (notifs: Notification[]) =>
      filter === "unread" ? notifs.filter((n) => !n.isRead) : notifs;

    return {
      emergency: filterNotifications(categorizedNotifications.emergency),
      hospital: filterNotifications(categorizedNotifications.hospital),
      status: filterNotifications(categorizedNotifications.status),
      system: filterNotifications(categorizedNotifications.system),
    };
  }, [categorizedNotifications, filter]);

  const getTimeAgo = (createdAt: string) => {
    const now = new Date();
    const created = new Date(createdAt);
    const diffInMinutes = Math.floor((now.getTime() - created.getTime()) / (1000 * 60));
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    return `${Math.floor(diffInHours / 24)} days ago`;
  };

  const getCategoryStyles = (category: string) => {
    switch (category) {
      case "emergency":
        return {
          icon: <AlertTriangle className="h-5 w-5 text-red-500" />,
          bg: "bg-red-50 dark:bg-red-900/20",
          border: "border-red-200 dark:border-red-800",
        };
      case "hospital":
        return {
          icon: <Hospital className="h-5 w-5 text-blue-500" />,
          bg: "bg-blue-50 dark:bg-blue-900/20",
          border: "border-blue-200 dark:border-blue-800",
        };
      case "status":
        return {
          icon: <CheckCircle className="h-5 w-5 text-green-500" />,
          bg: "bg-green-50 dark:bg-green-900/20",
          border: "border-green-200 dark:border-green-800",
        };
      case "system":
        return {
          icon: <Clock className="h-5 w-5 text-gray-500" />,
          bg: "bg-gray-50 dark:bg-gray-900/20",
          border: "border-gray-200 dark:border-gray-800",
        };
      default:
        return { icon: null, bg: "", border: "" };
    }
  };

  return (
    <div
      className={cn(
        "fixed top-0 right-0 h-full w-80 bg-white dark:bg-gray-900 shadow-xl transform transition-transform duration-300 z-50",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}
    >
      <div className="flex flex-col h-full">
        <CardHeader className="flex flex-row items-center justify-between border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
          <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-100">
            Notifications
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
          >
            <X className="h-5 w-5" />
          </Button>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-800">
          <div className="flex justify-between items-center mb-4">
            <Tabs
              value={filter}
              onValueChange={(value) => setFilter(value as "all" | "unread")}
              className="w-1/2"
            >
              <TabsList className="grid grid-cols-2 bg-gray-200 dark:bg-gray-700 rounded-lg p-1">
                <TabsTrigger
                  value="all"
                  className={cn(
                    "rounded-md",
                    filter === "all" && "bg-white dark:bg-gray-600 text-gray-800 dark:text-gray-100"
                  )}
                >
                  All
                </TabsTrigger>
                <TabsTrigger
                  value="unread"
                  className={cn(
                    "rounded-md",
                    filter === "unread" && "bg-white dark:bg-gray-600 text-gray-800 dark:text-gray-100"
                  )}
                >
                  Unread
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <Button
              variant="outline"
              size="sm"
              onClick={onMarkAllAsRead}
              disabled={notifications.every((n) => n.isRead)}
              className="text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
            >
              Mark all as read
            </Button>
          </div>

          {["emergency", "hospital", "status", "system"].map((category) => {
            const { icon, bg, border } = getCategoryStyles(category);
            return (
              <div key={category} className="mb-6">
                {filteredNotifications[category].length > 0 && (
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                    {icon}
                    <span className="capitalize">{category}</span>
                  </h3>
                )}
                {filteredNotifications[category].length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                    No notifications in this category
                  </p>
                ) : (
                  <AnimatePresence>
                    {filteredNotifications[category].map((notif) => (
                      <motion.div
                        key={notif.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Card
                          className={cn(
                            "mb-3 border shadow-sm hover:shadow-md transition-shadow duration-200",
                            border,
                            notif.isRead
                              ? "bg-white dark:bg-gray-700"
                              : "bg-gradient-to-r from-white to-blue-50 dark:from-gray-700 dark:to-blue-900/20"
                          )}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              {icon}
                              <div className="flex-1">
                                <div className="flex justify-between items-start">
                                  <p className="text-sm font-medium text-gray-800 dark:text-gray-100">
                                    {notif.title}
                                  </p>
                                  {!notif.isRead && (
                                    <Button
                                      variant="link"
                                      size="sm"
                                      onClick={() => onMarkAsRead(notif.id)}
                                      className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                                    >
                                      Mark as read
                                    </Button>
                                  )}
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                                  {notif.body}
                                </p>
                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                                  {getTimeAgo(notif.createdAt)}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
              </div>
            );
          })}
        </CardContent>
      </div>
    </div>
  );
}