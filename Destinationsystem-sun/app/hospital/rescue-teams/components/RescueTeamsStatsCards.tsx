// app/hospital/rescue-teams/components/RescueTeamsStatsCards.tsx
import { Card, CardHeader, CardTitle, CardContent } from "@components/ui/card";
import { Badge } from "@components/ui/badge";
import { Ambulance, Users } from "lucide-react";
import { RescueTeam } from "@/shared/types";

interface RescueTeamsStats {
  total: number;
  available: number;
  onMission: number;
  totalMembers: number;
}

interface RescueTeamsStatsCardsProps {
  stats: RescueTeamsStats;
}

export const RescueTeamsStatsCards: React.FC<RescueTeamsStatsCardsProps> = ({ stats }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Teams</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold">{stats.total}</div>
          <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-full">
            <Users className="h-5 w-5 text-slate-600 dark:text-slate-400" />
          </div>
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">Available Teams</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold">{stats.available}</div>
          <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-full">
            <Ambulance className="h-5 w-5 text-green-600 dark:text-green-500" />
          </div>
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">On Mission</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold">{stats.onMission}</div>
          <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-full">
            <Ambulance className="h-5 w-5 text-blue-600 dark:text-blue-500" />
          </div>
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Members</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold">{stats.totalMembers}</div>
          <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-full">
            <Users className="h-5 w-5 text-purple-600 dark:text-purple-500" />
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);