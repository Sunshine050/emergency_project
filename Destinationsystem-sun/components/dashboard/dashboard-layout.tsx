"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  AlertTriangle,
  LayoutDashboard,
  Bell,
  Users,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  Moon,
  Sun,
  ChevronsLeft,
  ChevronsRight,
  PhoneCall,
  Hospital,
  Ambulance,
  User,
  Check,
  Clock,
  Activity,
  Search,
  ChevronRight,
  MapPin
} from "lucide-react";
import { Button } from '@components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@components/ui/sheet";
import { ScrollArea } from "@components/ui/scroll-area";
import { useTheme } from "next-themes";
import { cn } from "@lib/utils";
import { useToast } from "@/shared/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
  metadata?: any;
}

interface DashboardLayoutProps {
  children: React.ReactNode;
  role: "emergency-center" | "hospital" | "rescue";
  notifications: Notification[] | undefined;
  unreadCount: number;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
}

const formatRelativeTime = (dateString: string): string => {
  const now = new Date();
  const date = new Date(dateString);
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInMinutes < 1) return "Just now";
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  if (diffInHours < 24) return `${diffInHours}h ago`;
  return `${diffInDays}d ago`;
};

export default function DashboardLayout({
  children,
  role,
  notifications = [],
  unreadCount,
  onMarkAsRead,
  onMarkAllAsRead,
}: DashboardLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();

  const roleIcon = {
    "emergency-center": <Activity className="h-6 w-6 text-red-500" />,
    hospital: <Hospital className="h-6 w-6 text-blue-500" />,
    rescue: <Ambulance className="h-6 w-6 text-green-500" />,
  };

  const roleName = {
    "emergency-center": "1669 Command",
    hospital: "Hospital Portal",
    rescue: "Rescue Unit",
  };

  const rolePaths = {
    "emergency-center": "/1669",
    hospital: "/hospital",
    rescue: "/rescue",
  };

  const getNavItems = (role: "emergency-center" | "hospital" | "rescue") => {
    const basePath = rolePaths[role];
    const items = [
      {
        name: "Dashboard",
        icon: <LayoutDashboard className="h-5 w-5" />,
        path: `${basePath}/dashboard`,
      },
      {
        name: "Emergency Cases",
        icon: <AlertTriangle className="h-5 w-5" />,
        path: `${basePath}/cases`,
      },
      {
        name: "Reports",
        icon: <FileText className="h-5 w-5" />,
        path: `${basePath}/reports`,
      },
      {
        name: "Settings",
        icon: <Settings className="h-5 w-5" />,
        path: `${basePath}/settings`,
      },
    ];

    if (role === "emergency-center") {
      items.splice(2, 0, {
        name: "Hospitals",
        icon: <Hospital className="h-5 w-5" />,
        path: `${basePath}/hospitals`,
      });
    } else if (role === "hospital") {
      items.splice(3, 0, {
        name: "Rescue Teams",
        icon: <Ambulance className="h-5 w-5" />,
        path: `${basePath}/rescue-teams`,
      });
    }

    return items;
  };

  const navItems = getNavItems(role);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    router.push("/login");
    toast({
      title: "Logged out successfully",
      description: "You have been logged out.",
    });
  };

  const handleMarkAsRead = (notificationId: string) => {
    onMarkAsRead(notificationId);
  };

  const handleClearAll = () => {
    onMarkAllAsRead();
    toast({
      title: "All notifications cleared",
      description: "All notifications have been marked as read.",
    });
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "emergency": return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case "hospital": return <Hospital className="h-5 w-5 text-blue-500" />;
      case "status": return <Check className="h-5 w-5 text-green-500" />;
      default: return <Clock className="h-5 w-5 text-slate-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 flex font-sans">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 ease-in-out flex flex-col shadow-xl md:shadow-none",
          isSidebarOpen ? "w-72" : "w-20",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        {/* Sidebar Header */}
        <div className="h-16 flex items-center px-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3 overflow-hidden whitespace-nowrap">
            <div className="shrink-0 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg">
              {roleIcon[role]}
            </div>
            <span
              className={cn(
                "font-bold text-lg tracking-tight transition-opacity duration-200",
                isSidebarOpen ? "opacity-100" : "opacity-0 hidden"
              )}
            >
              {roleName[role]}
            </span>
          </div>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 py-6">
          <nav className="space-y-1 px-3">
            {navItems.map((item) => {
              const isActive = pathname === item.path;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={cn(
                    "group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 relative overflow-hidden",
                    isActive
                      ? "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-foreground"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200"
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute inset-0 bg-primary/10 dark:bg-primary/20 rounded-xl"
                      initial={false}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10 shrink-0">{item.icon}</span>
                  <span
                    className={cn(
                      "relative z-10 truncate transition-all duration-200",
                      isSidebarOpen ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4 hidden"
                    )}
                  >
                    {item.name}
                  </span>
                  {isActive && isSidebarOpen && (
                    <ChevronRight className="ml-auto h-4 w-4 opacity-50 relative z-10" />
                  )}
                </Link>
              );
            })}
          </nav>
        </ScrollArea>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800">
          <div className={cn("flex items-center gap-3", !isSidebarOpen && "justify-center")}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full justify-start p-2 h-auto hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl">
                  <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white shrink-0 shadow-sm">
                    <User className="h-5 w-5" />
                  </div>
                  {isSidebarOpen && (
                    <div className="ml-3 flex flex-col items-start text-left overflow-hidden">
                      <span className="text-sm font-medium truncate w-full">Admin User</span>
                      <span className="text-xs text-slate-500 truncate w-full">admin@1669.th</span>
                    </div>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56" side="right" sideOffset={10}>
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Users className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div className={cn(
        "flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out",
        isSidebarOpen ? "md:pl-72" : "md:pl-20"
      )}>
        {/* Top Header */}
        <header className="h-16 sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/60 dark:border-slate-800/60 px-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={toggleMobileMenu}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="hidden md:flex text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
              onClick={toggleSidebar}
            >
              {isSidebarOpen ? <ChevronsLeft className="h-5 w-5" /> : <ChevronsRight className="h-5 w-5" />}
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  {theme === "dark" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setTheme("light")}>
                  <Sun className="mr-2 h-4 w-4" /> Light
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")}>
                  <Moon className="mr-2 h-4 w-4" /> Dark
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")}>
                  <Settings className="mr-2 h-4 w-4" /> System
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="relative rounded-full">
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-white dark:border-slate-900 animate-pulse" />
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent className="w-[400px] sm:w-[540px]">
                <SheetHeader className="border-b pb-4 mb-4">
                  <SheetTitle className="flex justify-between items-center">
                    <span>Notifications</span>
                    {unreadCount > 0 && (
                      <Button variant="ghost" size="sm" onClick={handleClearAll} className="text-xs h-8">
                        Mark all as read
                      </Button>
                    )}
                  </SheetTitle>
                </SheetHeader>
                <ScrollArea className="h-[calc(100vh-10rem)]">
                  <div className="space-y-2 pr-4">
                    {notifications.length > 0 ? (
                      notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={cn(
                            "group p-4 rounded-xl border transition-all duration-200 hover:shadow-md",
                            notification.isRead
                              ? "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800"
                              : "bg-blue-50/50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/20"
                          )}
                        >
                          <div className="flex gap-4">
                            <div className={cn(
                              "h-10 w-10 rounded-full flex items-center justify-center shrink-0",
                              notification.isRead ? "bg-slate-100 dark:bg-slate-800" : "bg-white dark:bg-slate-900 shadow-sm"
                            )}>
                              {getNotificationIcon(notification.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start mb-1">
                                <h4 className={cn("font-semibold text-sm truncate pr-2", !notification.isRead && "text-primary")}>
                                  {notification.title}
                                </h4>
                                <span className="text-[10px] text-slate-400 shrink-0">
                                  {formatRelativeTime(notification.createdAt)}
                                </span>
                              </div>
                              <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                                {notification.body}
                              </p>
                              {!notification.isRead && (
                                <Button
                                  variant="link"
                                  size="sm"
                                  className="h-auto p-0 mt-2 text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={() => handleMarkAsRead(notification.id)}
                                >
                                  Mark as read
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                        <Bell className="h-12 w-12 mb-4 opacity-20" />
                        <p>No notifications yet</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </SheetContent>
            </Sheet>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 md:p-8 overflow-auto">
          <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-30 md:hidden"
          onClick={toggleMobileMenu}
        />
      )}
    </div>
  );
}