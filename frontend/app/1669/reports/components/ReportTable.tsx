// app/1669/reports/components/ReportTable.tsx
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@components/ui/table";
import { Button } from "@components/ui/button";
import { Badge } from "@components/ui/badge";
import { Eye, Download } from "lucide-react";
import { cn } from "@lib/utils";
import { Report } from "@/shared/types";

interface ReportTableProps {
  reports: Report[];
  onView: (report: Report) => void;
  onDownload: (report: Report) => void;
}

export const ReportTable: React.FC<ReportTableProps> = ({ reports, onView, onDownload }) => (
  <Table>
    <TableHeader>
      <TableRow className="bg-slate-50 dark:bg-slate-800/50">
        <TableHead>รายงาน ID</TableHead>
        <TableHead>ชื่อ</TableHead>
        <TableHead>ประเภท</TableHead>
        <TableHead>วันที่</TableHead>
        <TableHead>ความรุนแรง</TableHead>
        <TableHead>สถานะ</TableHead>
        <TableHead className="text-right">การกระทำ</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {reports.map((report) => (
        <TableRow key={report.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
          <TableCell className="font-medium">#{report.id.slice(-8)}</TableCell>
          <TableCell>{report.title}</TableCell>
          <TableCell>{report.type}</TableCell>
          <TableCell>{new Date(report.date).toLocaleDateString("th-TH")}</TableCell>
          <TableCell>
            <Badge
              className={cn(
                report.stats.severity === 4 ? "text-red-600 border-red-600" :
                report.stats.severity === 3 ? "text-orange-600 border-orange-200" :
                report.stats.severity === 2 ? "text-yellow-600 border-yellow-200" :
                "text-green-600 border-green-200"
              )}
              variant="outline"
            >
              ระดับ {report.stats.severity ?? "N/A"}
            </Badge>
          </TableCell>
          <TableCell>
            <Badge
              className={cn(
                report.stats.status === "pending" ? "bg-amber-100 text-amber-800" :
                report.stats.status === "assigned" ? "bg-blue-100 text-blue-800" :
                report.stats.status === "in-progress" ? "bg-purple-100 text-purple-800" :
                report.stats.status === "completed" ? "bg-green-100 text-green-800" :
                "bg-red-100 text-red-800"
              )}
            >
              {report.stats.status
                ? report.stats.status.charAt(0).toUpperCase() + report.stats.status.slice(1)
                : "Pending"}
            </Badge>
          </TableCell>
          <TableCell className="text-right">
            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => onView(report)} className="hover:bg-primary/10">
                <Eye className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => onDownload(report)} className="hover:bg-primary/10">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
);
