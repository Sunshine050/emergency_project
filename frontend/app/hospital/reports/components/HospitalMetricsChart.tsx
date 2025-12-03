"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@components/ui/tabs";
import { useHospitalReports } from "../hooks/useHospitalReports";

export const HospitalMetricsChart = () => {
  const { chartData, timePeriod } = useHospitalReports();

  // Simple bar chart using CSS
  const BarChart = ({ data, label, color }: { data: number[]; label: string; color: string }) => {
    const maxValue = Math.max(...data);
    
    return (
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-slate-600 dark:text-slate-400">{label}</h4>
        <div className="flex items-end justify-between gap-2 h-48">
          {data.map((value, index) => (
            <div key={index} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-t relative flex-1 flex items-end">
                <div
                  className={`w-full ${color} rounded-t transition-all duration-500 ease-out`}
                  style={{ height: `${(value / maxValue) * 100}%` }}
                  title={`${value}`}
                />
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {chartData.labels[index]}
              </span>
            </div>
          ))}
        </div>
        <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mt-2">
          <span>Min: {Math.min(...data)}</span>
          <span>Max: {Math.max(...data)}</span>
          <span>Avg: {Math.round(data.reduce((a, b) => a + b, 0) / data.length)}</span>
        </div>
      </div>
    );
  };

  // Line chart using CSS
  const LineChart = ({ data, label, color }: { data: number[]; label: string; color: string }) => {
    const maxValue = Math.max(...data);
    const minValue = Math.min(...data);
    const range = maxValue - minValue;
    
    return (
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-slate-600 dark:text-slate-400">{label}</h4>
        <div className="relative h-48 bg-slate-50 dark:bg-slate-900 rounded-lg p-4">
          {/* Grid lines */}
          <div className="absolute inset-0 flex flex-col justify-between p-4">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="border-t border-slate-200 dark:border-slate-700" />
            ))}
          </div>
          
          {/* Line chart */}
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <polyline
              fill="none"
              stroke={color.replace('bg-', '').replace('-500', '')}
              strokeWidth="2"
              points={data
                .map((value, index) => {
                  const x = (index / (data.length - 1)) * 100;
                  const y = 100 - ((value - minValue) / range) * 100;
                  return `${x},${y}`;
                })
                .join(' ')}
            />
            {/* Data points */}
            {data.map((value, index) => {
              const x = (index / (data.length - 1)) * 100;
              const y = 100 - ((value - minValue) / range) * 100;
              return (
                <circle
                  key={index}
                  cx={x}
                  cy={y}
                  r="2"
                  className={color.replace('bg-', 'fill-')}
                />
              );
            })}
          </svg>
        </div>
        <div className="flex justify-between text-xs">
          {chartData.labels.map((label, index) => (
            <span key={index} className="text-slate-500 dark:text-slate-400">
              {label}
            </span>
          ))}
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance Metrics</CardTitle>
        <CardDescription>
          Hospital performance overview for {timePeriod === "week" ? "the last week" : timePeriod === "month" ? "the last month" : timePeriod === "quarter" ? "the last quarter" : "the last year"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="emergency" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="emergency">Emergency Cases</TabsTrigger>
            <TabsTrigger value="occupancy">Bed Occupancy</TabsTrigger>
          </TabsList>
          
          <TabsContent value="emergency" className="mt-6">
            <BarChart
              data={chartData.datasets[0].data}
              label={chartData.datasets[0].label}
              color="bg-red-500"
            />
          </TabsContent>
          
          <TabsContent value="occupancy" className="mt-6">
            <LineChart
              data={chartData.datasets[1].data}
              label={chartData.datasets[1].label}
              color="bg-blue-500"
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};