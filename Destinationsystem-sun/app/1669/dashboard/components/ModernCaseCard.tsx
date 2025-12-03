// app/1669/dashboard/components/ModernCaseCard.tsx
import { Card, CardContent } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Badge } from "@components/ui/badge";
import { EmergencyCase } from "@/shared/types";

interface ModernCaseCardProps {
  emergencyCase: EmergencyCase;
  role: string;
  onViewDetails: (caseItem: EmergencyCase) => void;
}

export const ModernCaseCard: React.FC<ModernCaseCardProps> = ({ emergencyCase, role, onViewDetails }) => {
  const gradeColors: Record<EmergencyCase["grade"], string> = {
    CRITICAL: "bg-red-500",
    URGENT: "bg-orange-500",
    NON_URGENT: "bg-yellow-500",
    UNKNOWN: "bg-gray-400", // ✅ เพิ่มตรงนี้
  };

  const statusColors = {
    pending: "bg-gray-500",
    assigned: "bg-blue-500",
    "in-progress": "bg-purple-500",
    completed: "bg-green-500",
    cancelled: "bg-gray-400",
  };

  const statusText = {
    pending: "รอดำเนินการ",
    assigned: "มอบหมายแล้ว",
    "in-progress": "กำลังดำเนินการ",
    completed: "เสร็จสิ้น",
    cancelled: "ยกเลิก",
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${gradeColors[emergencyCase.grade]}`} />
            <span className="font-semibold text-sm">#{emergencyCase.id.slice(0, 8)}</span>
          </div>
          <Badge className={`${statusColors[emergencyCase.status]} text-white`}>
            {statusText[emergencyCase.status]}
          </Badge>
        </div>

        <h3 className="font-semibold mb-2">{emergencyCase.emergencyType}</h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">{emergencyCase.description}</p>

        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-slate-500">ผู้ป่วย:</span>
            <span className="font-medium">{emergencyCase.patientName}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-500">สถานที่:</span>
            <span className="font-medium">{emergencyCase.location.address}</span>
          </div>
          {emergencyCase.assignedTo && (
            <div className="flex items-center gap-2">
              <span className="text-slate-500">มอบหมายให้:</span>
              <span className="font-medium">{emergencyCase.assignedTo}</span>
            </div>
          )}
        </div>

        <div className="mt-3 pt-3 border-t flex justify-between items-center text-xs text-slate-500">
          <span>{new Date(emergencyCase.reportedAt).toLocaleString("th-TH")}</span>
          <Button size="sm" variant="outline" onClick={() => onViewDetails(emergencyCase)}>
            ดูรายละเอียด
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
