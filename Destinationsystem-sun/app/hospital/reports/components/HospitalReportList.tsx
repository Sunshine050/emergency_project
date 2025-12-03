import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Badge } from "@components/ui/badge";
import { Download, FileText, Calendar, CheckCircle, Clock, XCircle } from "lucide-react";
import type { HospitalReport } from "../hooks/useHospitalReports";

interface HospitalReportListProps {
  reports: HospitalReport[];
  onDownload: (reportId: string) => void;
}

export const HospitalReportList: React.FC<HospitalReportListProps> = ({ reports, onDownload }) => {
  const getReportTypeColor = (type: string) => {
    switch (type) {
      case "emergency":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
      case "resources":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
      case "patients":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "performance":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400";
      default:
        return "bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-400";
    }
  };

  const getReportTypeLabel = (type: string) => {
    switch (type) {
      case "emergency":
        return "Emergency";
      case "resources":
        return "Resources";
      case "patients":
        return "Patients";
      case "performance":
        return "Performance";
      default:
        return type;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "generating":
        return <Clock className="h-4 w-4 text-amber-600 animate-spin" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  if (reports.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Generated Reports</CardTitle>
          <CardDescription>Your hospital reports will appear here</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <FileText className="h-12 w-12 text-slate-300 dark:text-slate-700 mb-4" />
            <p className="text-slate-500 dark:text-slate-400 mb-2">No reports generated yet</p>
            <p className="text-sm text-slate-400 dark:text-slate-500">
              Click "Generate Report" to create your first report
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Generated Reports</CardTitle>
        <CardDescription>Download and view your hospital reports</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {reports.map((report) => (
            <div
              key={report.id}
              className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
            >
              <div className="flex items-start gap-4 flex-1">
                <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                  <FileText className="h-6 w-6 text-slate-600 dark:text-slate-400" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-slate-900 dark:text-slate-100 truncate">
                      {report.title}
                    </h3>
                    {getStatusIcon(report.status)}
                  </div>
                  
                  <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
                    <Badge variant="outline" className={getReportTypeColor(report.type)}>
                      {getReportTypeLabel(report.type)}
                    </Badge>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate(report.generatedAt)}</span>
                    </div>
                  </div>
                  
                  {report.period && (
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                      Period: {report.period}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 ml-4">
                {report.status === "completed" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDownload(report.id)}
                    className="gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </Button>
                )}
                {report.status === "generating" && (
                  <Button variant="outline" size="sm" disabled>
                    Generating...
                  </Button>
                )}
                {report.status === "failed" && (
                  <Button variant="outline" size="sm" disabled>
                    Failed
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};