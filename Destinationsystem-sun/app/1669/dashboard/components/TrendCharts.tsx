// app/1669/dashboard/components/TrendCharts.tsx
import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Line } from "recharts";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@components/ui/card";
import { TrendingUp, Download, FileText, FileSpreadsheet } from "lucide-react";
import { MonthlyTrendData } from "@/shared/types";
import { Button } from "@components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@components/ui/dropdown-menu";

interface TrendChartsProps {
  data: MonthlyTrendData[];
  period: string;
}

// Custom Tooltip
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700">
        <p className="font-semibold text-sm mb-2 text-slate-900 dark:text-slate-100">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center justify-between gap-4 text-xs py-0.5">
            <span style={{ color: entry.color }} className="font-medium">{entry.name}:</span>
            <span className="font-bold" style={{ color: entry.color }}>{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// Export to CSV
const exportToCSV = (data: MonthlyTrendData[]) => {
  const headers = ['Month', 'Total Cases', 'Critical', 'Urgent', 'Non-Urgent'];
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      [row.month, row.admissions, row.critical, row.urgent, row.nonUrgent].join(',')
    )
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `emergency-cases-${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Export to PDF
const exportToPDF = async (data: MonthlyTrendData[]) => {
  // Create a simple HTML table for PDF
  const tableHTML = `
    <html>
      <head>
        <title>Emergency Cases Report</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { color: #1e40af; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          th { background-color: #3b82f6; color: white; }
          tr:nth-child(even) { background-color: #f3f4f6; }
          .footer { margin-top: 30px; font-size: 12px; color: #6b7280; }
        </style>
      </head>
      <body>
        <h1>Emergency Cases Report</h1>
        <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
        <table>
          <thead>
            <tr>
              <th>Month</th>
              <th>Total Cases</th>
              <th>Critical</th>
              <th>Urgent</th>
              <th>Non-Urgent</th>
            </tr>
          </thead>
          <tbody>
            ${data.map(row => `
              <tr>
                <td>${row.month}</td>
                <td>${row.admissions}</td>
                <td>${row.critical}</td>
                <td>${row.urgent}</td>
                <td>${row.nonUrgent}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div class="footer">
          <p>Emergency Response System © 2025</p>
        </div>
      </body>
    </html>
  `;

  // Open print dialog
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(tableHTML);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  }
};

export const TrendCharts: React.FC<TrendChartsProps> = ({ data, period }) => {
  return (
    <Card className="border-slate-200 dark:border-slate-800 shadow-lg overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:to-slate-800 border-b border-slate-200 dark:border-slate-700 pb-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex-1">
            <CardTitle className="text-2xl font-bold flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              Emergency Cases Analytics
            </CardTitle>
            <CardDescription className="mt-2 text-base">
              Comprehensive overview of all emergency case trends and severity levels
            </CardDescription>
          </div>
          
          {/* Export Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700">
                <Download className="h-4 w-4" />
                Export Data
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => exportToCSV(data)} className="gap-2 cursor-pointer">
                <FileSpreadsheet className="h-4 w-4 text-green-600" />
                <span>Export as CSV</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportToPDF(data)} className="gap-2 cursor-pointer">
                <FileText className="h-4 w-4 text-red-600" />
                <span>Export as PDF</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="pt-8 pb-6">
        {data.length > 0 ? (
          <div className="space-y-6">
            {/* Main Chart */}
            <ResponsiveContainer width="100%" height={450}>
              <LineChart data={data} margin={{ top: 10, right: 30, left: 10, bottom: 20 }}>
                <defs>
                  {/* Gradient for Total Cases */}
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
                
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  stroke="#cbd5e1"
                  tickMargin={10}
                />
                
                <YAxis 
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  stroke="#cbd5e1"
                  tickMargin={10}
                />
                
                <Tooltip content={<CustomTooltip />} />
                
                <Legend 
                  wrapperStyle={{ paddingTop: '20px', fontSize: '14px' }}
                  iconType="line"
                  iconSize={16}
                />
                
                {/* Total Cases - Main Line (Blue) */}
                <Line 
                  type="monotone" 
                  dataKey="admissions" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  dot={{ fill: '#3b82f6', r: 5, strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 7, strokeWidth: 2 }}
                  name="Total Cases"
                />
                
                {/* Critical Cases (Red) */}
                <Line 
                  type="monotone" 
                  dataKey="critical" 
                  stroke="#dc2626" 
                  strokeWidth={2.5}
                  dot={{ fill: '#dc2626', r: 4, strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 6 }}
                  name="Critical"
                />
                
                {/* Urgent Cases (Orange) */}
                <Line 
                  type="monotone" 
                  dataKey="urgent" 
                  stroke="#f59e0b" 
                  strokeWidth={2.5}
                  dot={{ fill: '#f59e0b', r: 4, strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 6 }}
                  name="Urgent"
                />
                
                {/* Non-Urgent Cases (Green) */}
                <Line 
                  type="monotone" 
                  dataKey="nonUrgent" 
                  stroke="#10b981" 
                  strokeWidth={2.5}
                  dot={{ fill: '#10b981', r: 4, strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 6 }}
                  name="Non-Urgent"
                />
              </LineChart>
            </ResponsiveContainer>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
              {[
                { label: 'Total Cases', value: data.reduce((sum, d) => sum + (d.admissions || 0), 0), color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20' },
                { label: 'Critical', value: data.reduce((sum, d) => sum + (d.critical || 0), 0), color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20' },
                { label: 'Urgent', value: data.reduce((sum, d) => sum + (d.urgent || 0), 0), color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-900/20' },
                { label: 'Non-Urgent', value: data.reduce((sum, d) => sum + (d.nonUrgent || 0), 0), color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/20' },
              ].map((stat, index) => (
                <div key={index} className={`${stat.bg} p-4 rounded-lg border border-slate-200 dark:border-slate-700`}>
                  <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">{stat.label}</p>
                  <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-96 text-slate-500">
            <div className="text-center">
              <TrendingUp className="h-16 w-16 mx-auto mb-4 text-slate-300 dark:text-slate-600" />
              <p className="font-medium">No data available</p>
              <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Data will appear here once cases are recorded</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};