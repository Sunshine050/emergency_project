// app/hospital/dashboard/components/HospitalDashboardCards.tsx
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@components/ui/card";
import { Badge } from "@components/ui/badge";
import { Clock, Activity, AlertTriangle, Heart, Ambulance, Users, Info } from "lucide-react";
import { ApiRescueTeam } from "@/shared/types";
import { Alert, AlertDescription } from "@components/ui/alert";

interface HospitalDashboardStats {
  assigned: number;
  inProgress: number;
  completed: number;
  critical: number;
  total: number;
  beds: {
    total: number;
    occupied: number;
    available: number;
    icu: {
      total: number;
      occupied: number;
      available: number;
    };
  };
  resources: {
    totalStaff: number;
    availableStaff: number;
    totalAmbulances: number;
    availableAmbulances: number;
  };
}

interface HospitalDashboardCardsProps {
  stats: HospitalDashboardStats;
  rescueTeams?: ApiRescueTeam[];
  error?: string | null;
}

// Helper function to get status color
const getTeamStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'available':
    case 'active':
      return {
        bg: 'bg-green-50 dark:bg-green-900/10',
        iconBg: 'bg-green-100 dark:bg-green-900/20',
        iconColor: 'text-green-600 dark:text-green-500',
        badgeBg: 'bg-green-100 dark:bg-green-900/20',
        badgeColor: 'text-green-600 dark:text-green-500',
      };
    case 'busy':
    case 'off_duty':
      return {
        bg: 'bg-amber-50 dark:bg-amber-900/10',
        iconBg: 'bg-amber-100 dark:bg-amber-900/20',
        iconColor: 'text-amber-600 dark:text-amber-500',
        badgeBg: 'bg-amber-100 dark:bg-amber-900/20',
        badgeColor: 'text-amber-600 dark:text-amber-500',
      };
    case 'maintenance':
    case 'inactive':
      return {
        bg: 'bg-red-50 dark:bg-red-900/10',
        iconBg: 'bg-red-100 dark:bg-red-900/20',
        iconColor: 'text-red-600 dark:text-red-500',
        badgeBg: 'bg-red-100 dark:bg-red-900/20',
        badgeColor: 'text-red-600 dark:text-red-500',
      };
    default:
      return {
        bg: 'bg-slate-50 dark:bg-slate-800',
        iconBg: 'bg-slate-100 dark:bg-slate-700',
        iconColor: 'text-slate-600 dark:text-slate-400',
        badgeBg: 'bg-slate-100 dark:bg-slate-700',
        badgeColor: 'text-slate-600 dark:text-slate-400',
      };
  }
};

export const HospitalDashboardCards: React.FC<HospitalDashboardCardsProps> = ({ stats, rescueTeams = [], error }) => {
  // คำนวณจำนวน bed ทั่วไปไม่รวม ICU
  const generalBeds = {
    total: stats.beds.total - stats.beds.icu.total,
    occupied: stats.beds.occupied - stats.beds.icu.occupied,
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Error Alert - แสดงถ้ามี error */}
      {error && (
        <div className="lg:col-span-2">
          <Alert variant="destructive">
            <Info className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      )}

      {/* Stats Cards */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">Assigned Cases</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold">{stats.assigned}</div>
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-full">
              <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">In Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold">{stats.inProgress}</div>
            <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-full">
              <Activity className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">Critical Cases</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold">{stats.critical}</div>
            <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-full">
              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">Available Beds</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold">{stats.beds.available}</div>
            <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-full">
              <Heart className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resource Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Hospital Resources</CardTitle>
          <CardDescription>Current capacity and availability</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">General Beds</span>
                <span className="text-sm text-slate-500">{generalBeds.occupied}/{generalBeds.total}</span>
              </div>
              <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 rounded-full" 
                  style={{ width: `${generalBeds.total > 0 ? (generalBeds.occupied / generalBeds.total) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">ICU Beds</span>
                <span className="text-sm text-slate-500">{stats.beds.icu.occupied}/{stats.beds.icu.total}</span>
              </div>
              <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-red-500 rounded-full" 
                  style={{ width: `${stats.beds.icu.total > 0 ? (stats.beds.icu.occupied / stats.beds.icu.total) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Emergency Staff</span>
                <span className="text-sm text-slate-500">{stats.resources.availableStaff}/{stats.resources.totalStaff}</span>
              </div>
              <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-green-500 rounded-full" 
                  style={{ width: `${stats.resources.totalStaff > 0 ? (stats.resources.availableStaff / stats.resources.totalStaff) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Ambulances</span>
                <span className="text-sm text-slate-500">{stats.resources.availableAmbulances}/{stats.resources.totalAmbulances}</span>
              </div>
              <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-amber-500 rounded-full" 
                  style={{ width: `${stats.resources.totalAmbulances > 0 ? (stats.resources.availableAmbulances / stats.resources.totalAmbulances) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rescue Teams */}
      <Card>
        <CardHeader>
          <CardTitle>Rescue Teams</CardTitle>
          <CardDescription>Active teams and availability</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {rescueTeams.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4">No rescue teams data available</p>
            ) : (
              rescueTeams.slice(0, 4).map((team) => {
                const colors = getTeamStatusColor(team.status);
                return (
                  <div key={team.id} className={`flex items-center justify-between p-3 ${colors.bg} rounded-lg`}>
                    <div className="flex items-center gap-3">
                      <div className={`p-2 ${colors.iconBg} rounded-full`}>
                        <Ambulance className={`h-5 w-5 ${colors.iconColor}`} />
                      </div>
                      <div>
                        <p className="font-medium">{team.name}</p>
                        <p className="text-sm text-slate-500">
                          {team.vehicleTypes && team.vehicleTypes.length > 0 
                            ? team.vehicleTypes.join(", ") 
                            : "No vehicle info"}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className={`${colors.badgeBg} ${colors.badgeColor}`}>
                      {team.status}
                    </Badge>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};