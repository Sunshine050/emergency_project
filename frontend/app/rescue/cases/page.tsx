"use client";

import { useState } from 'react';
import dynamic from 'next/dynamic'; // เพิ่มตรงนี้

import DashboardLayout from '@components/dashboard/dashboard-layout';
import { Button } from '@components/ui/button';
import { Input } from '@components/ui/input';
import { Badge } from '@components/ui/badge';
import {
  Search,
  Filter,
  MapPin,
  ChevronDown,
  AlertTriangle,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@components/ui/dropdown-menu';

import RescueCaseCard from './components/RescueCaseCard';
import { useRescueCases } from './hooks/useRescueCases';
import { useNotifications } from '../../useNotifications';

import { MapLocation } from '@/shared/types';

// แก้ตรงนี้ ใช้ dynamic import แบบไม่ SSR สำหรับ MapView
const MapView = dynamic(() => import('@components/dashboard/map-view'), {
  ssr: false,
});

export default function RescueCases() {
  const { cases, loading, error, handleCompleteCase, handleCancelCase } = useRescueCases();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [filters, setFilters] = useState({
    status: 'all',
    severity: 'all',
    date: 'all',
  });
  const [selectedLocation, setSelectedLocation] = useState<MapLocation | null>(null);

  // Filter cases
  const filteredCases = cases.filter(c => {
    const matchesSearch =
      c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.emergencyType.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = filters.status === 'all' || c.status === filters.status;
    const matchesSeverity = filters.severity === 'all' || c.severity.toString() === filters.severity;
    const matchesDate = filters.date === 'all';

    return matchesSearch && matchesStatus && matchesSeverity && matchesDate;
  });

  // Convert to MapLocation format
  const getMapLocations = (): MapLocation[] => {
    return filteredCases.map(c => ({
      id: c.id,
      title: c.title,
      severity: c.severity,
      coordinates: [c.location.coordinates.lat, c.location.coordinates.lng] as [number, number],
      address: c.location.address,
      description: c.description,
      patientName: c.patientName,
      status: c.status,
    }));
  };

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
            <h1 className="text-2xl font-bold">Emergency Cases</h1>
            <p className="text-slate-500 dark:text-slate-400">
              Manage and track assigned rescue missions
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
            <Input
              type="search"
              placeholder="Search by ID, name, or type..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Select value={filters.status} onValueChange={(v) => setFilters({ ...filters, status: v })}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.severity} onValueChange={(v) => setFilters({ ...filters, severity: v })}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                <SelectItem value="1">Grade 1</SelectItem>
                <SelectItem value="2">Grade 2</SelectItem>
                <SelectItem value="3">Grade 3</SelectItem>
                <SelectItem value="4">Grade 4</SelectItem>
              </SelectContent>
            </Select>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  More Filters
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuLabel>Date Range</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {['all', 'today', 'yesterday', 'week'].map((opt) => (
                  <DropdownMenuCheckboxItem
                    key={opt}
                    checked={filters.date === opt}
                    onCheckedChange={() => setFilters({ ...filters, date: opt })}
                  >
                    {opt === 'all' ? 'All Dates' : opt === 'today' ? 'Today' : opt === 'yesterday' ? 'Yesterday' : 'This Week'}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="flex border rounded-md">
              <Button
                variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                size="sm"
                className="rounded-r-none"
                onClick={() => setViewMode('list')}
              >
                List
              </Button>
              <Button
                variant={viewMode === 'map' ? 'secondary' : 'ghost'}
                size="sm"
                className="rounded-l-none"
                onClick={() => setViewMode('map')}
              >
                <MapPin className="h-4 w-4 mr-1" />
                Map
              </Button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total</p>
              <Badge className="bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200">
                {filteredCases.length}
              </Badge>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">In Progress</p>
              <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-500">
                {filteredCases.filter(c => c.status === 'in-progress').length}
              </Badge>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Critical</p>
              <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-500">
                {filteredCases.filter(c => c.severity === 4).length}
              </Badge>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Completed</p>
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500">
                {filteredCases.filter(c => c.status === 'completed').length}
              </Badge>
            </div>
          </div>
        </div>

        {/* List or Map View */}
        {viewMode === 'list' ? (
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-8 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
                <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                <p className="text-slate-500 dark:text-slate-400">Loading cases...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
                <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-red-500" />
                <p className="text-red-500 font-medium">Error loading cases</p>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{error}</p>
              </div>
            ) : filteredCases.length === 0 ? (
              <div className="text-center py-8 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
                <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-slate-400" />
                <p className="text-slate-500 dark:text-slate-400">No cases found matching your criteria</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {filteredCases.map((c) => (
                  <div key={c.id} id={`case-${c.id}`}>
                    <RescueCaseCard
                      {...c}
                      onComplete={() => handleCompleteCase(c.id)}
                      onCancel={() => handleCancelCase(c.id)}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="h-[500px] w-full rounded-lg overflow-hidden border shadow-sm">
              <MapView
                locations={getMapLocations()}
                selectedLocation={selectedLocation}
                setSelectedLocation={setSelectedLocation}
              />
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
              Showing {filteredCases.length} emergency cases on the map. Hover over markers for details.
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
