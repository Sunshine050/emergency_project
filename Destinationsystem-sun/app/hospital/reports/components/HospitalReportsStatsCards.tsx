import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card";
import { Clock, Bed, Heart, Users, Activity, AlertCircle, TrendingUp } from "lucide-react";

interface HospitalReportsStatsCardsProps {
  stats: {
    avgWaitTime: number;
    bedOccupancy: number;
    satisfaction: number;
    staffUtilization: number;
    totalPatients?: number;
    emergencyCases?: number;
    avgResponseTime?: number;
  };
}

export const HospitalReportsStatsCards: React.FC<HospitalReportsStatsCardsProps> = ({ stats }) => {
  const cards = [
    {
      title: "Average Wait Time",
      value: `${stats.avgWaitTime} min`,
      icon: Clock,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-100 dark:bg-blue-900/20",
      trend: stats.avgWaitTime < 30 ? "good" : "warning",
    },
    {
      title: "Bed Occupancy",
      value: `${stats.bedOccupancy}%`,
      icon: Bed,
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-100 dark:bg-purple-900/20",
      trend: stats.bedOccupancy > 90 ? "warning" : "good",
    },
    {
      title: "Patient Satisfaction",
      value: `${stats.satisfaction}%`,
      icon: Heart,
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-100 dark:bg-green-900/20",
      trend: stats.satisfaction > 85 ? "good" : "warning",
    },
    {
      title: "Staff Utilization",
      value: `${stats.staffUtilization}%`,
      icon: Users,
      color: "text-amber-600 dark:text-amber-400",
      bgColor: "bg-amber-100 dark:bg-amber-900/20",
      trend: stats.staffUtilization > 80 && stats.staffUtilization < 95 ? "good" : "warning",
    },
  ];

  const additionalCards = [];
  
  if (stats.totalPatients !== undefined) {
    additionalCards.push({
      title: "Total Patients",
      value: stats.totalPatients.toLocaleString(),
      icon: Activity,
      color: "text-indigo-600 dark:text-indigo-400",
      bgColor: "bg-indigo-100 dark:bg-indigo-900/20",
      trend: "neutral" as const,
    });
  }

  if (stats.emergencyCases !== undefined) {
    additionalCards.push({
      title: "Emergency Cases",
      value: stats.emergencyCases.toLocaleString(),
      icon: AlertCircle,
      color: "text-red-600 dark:text-red-400",
      bgColor: "bg-red-100 dark:bg-red-900/20",
      trend: "neutral" as const,
    });
  }

  if (stats.avgResponseTime !== undefined) {
    additionalCards.push({
      title: "Avg Response Time",
      value: `${stats.avgResponseTime} min`,
      icon: TrendingUp,
      color: "text-cyan-600 dark:text-cyan-400",
      bgColor: "bg-cyan-100 dark:bg-cyan-900/20",
      trend: stats.avgResponseTime < 10 ? "good" : "warning",
    });
  }

  const allCards = [...cards, ...additionalCards];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {allCards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                {card.title}
              </CardTitle>
              <div className={`p-2 ${card.bgColor} rounded-full`}>
                <Icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between">
                <div className="text-2xl font-bold">{card.value}</div>
                {card.trend === "good" && (
                  <div className="flex items-center text-xs text-green-600 dark:text-green-400">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    Good
                  </div>
                )}
                {card.trend === "warning" && (
                  <div className="flex items-center text-xs text-amber-600 dark:text-amber-400">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Alert
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
