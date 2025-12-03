// components/RescueTrendCharts.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card';
import { Activity, Clock, AlertTriangle, Users } from 'lucide-react';

interface RescueTrendChartsProps {
  stats: {
    inProgress: number;
    completed: number;
    critical: number;
    total: number;
    availableTeams: number;
  };
}

export default function RescueTrendCharts({ stats }: RescueTrendChartsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Active Missions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold">{stats.inProgress}</div>
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-full">
              <Activity className="h-5 w-5 text-blue-600 dark:text-blue-500" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Completed Today
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold">{stats.completed}</div>
            <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-full">
              <Clock className="h-5 w-5 text-green-600 dark:text-green-500" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Critical Cases
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold">{stats.critical}</div>
            <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-full">
              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-500" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Available Teams
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold">{stats.availableTeams}</div>
            <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-full">
              <Users className="h-5 w-5 text-purple-600 dark:text-purple-500" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}