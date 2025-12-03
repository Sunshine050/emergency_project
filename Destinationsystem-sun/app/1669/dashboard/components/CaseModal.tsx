// app/1669/dashboard/components/CaseModal.tsx
// Modal for case details
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@components/ui/dialog";
import { EmergencyCase } from "@/shared/types";
import { Badge } from "@components/ui/badge";
import { User, Phone, MapPin, Clock, AlertTriangle, Activity, FileText } from "lucide-react";

interface CaseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCase: EmergencyCase | null;
}

export const CaseModal: React.FC<CaseModalProps> = ({ open, onOpenChange, selectedCase }) => {
  if (!selectedCase) return null;

  const getSeverityColor = (grade: string) => {
    switch (grade) {
      case "CRITICAL": return "bg-red-500 hover:bg-red-600";
      case "URGENT": return "bg-orange-500 hover:bg-orange-600";
      case "NON_URGENT": return "bg-green-500 hover:bg-green-600";
      default: return "bg-gray-500";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING": return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "ASSIGNED": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "IN_PROGRESS": return "bg-purple-500/10 text-purple-500 border-purple-500/20";
      case "COMPLETED": return "bg-green-500/10 text-green-500 border-green-500/20";
      default: return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between text-xl font-bold">
            <div className="flex items-center gap-3">
              <span>{selectedCase.emergencyType}</span>
              <Badge className={`${getSeverityColor(selectedCase.grade)} text-white border-0`}>
                {selectedCase.grade}
              </Badge>
            </div>
            <Badge variant="outline" className={getStatusColor(selectedCase.status)}>
              {selectedCase.status}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4 grid gap-6">
          {/* Patient Information */}
          <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-semibold text-slate-500 mb-3 flex items-center gap-2">
              <User className="w-4 h-4" /> ข้อมูลผู้ป่วย
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-500">ชื่อ-นามสกุล</p>
                <p className="font-medium">{selectedCase.patientName}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">ระดับความรุนแรง (Triage)</p>
                <p className="font-medium flex items-center gap-2">
                  <AlertTriangle className={`w-3 h-3 ${
                    selectedCase.severity === 1 ? 'text-red-500' :
                    selectedCase.severity === 2 ? 'text-orange-500' :
                    selectedCase.severity === 3 ? 'text-yellow-500' :
                    'text-green-500'
                  }`} />
                  <span>
                    ระดับ {selectedCase.severity}
                    <span className="text-slate-400 text-xs ml-1 font-normal">
                      ({
                        selectedCase.severity === 1 ? 'วิกฤต' :
                        selectedCase.severity === 2 ? 'ฉุกเฉิน' :
                        selectedCase.severity === 3 ? 'เร่งด่วน' :
                        'ทั่วไป'
                      })
                    </span>
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Incident Details */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-500 mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4" /> รายละเอียดเหตุการณ์
                </h3>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  {selectedCase.descriptionFull}
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-semibold text-slate-500 mb-2 flex items-center gap-2">
                  <Activity className="w-4 h-4" /> อาการ
                </h3>
                <div className="flex flex-wrap gap-2">
                  {selectedCase.symptoms.map((symptom, index) => (
                    <Badge key={index} variant="secondary" className="text-xs font-normal">
                      {symptom}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-500 mb-2 flex items-center gap-2">
                  <MapPin className="w-4 h-4" /> สถานที่เกิดเหตุ
                </h3>
                <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded border border-slate-100 dark:border-slate-800 text-sm">
                  <p className="font-medium mb-1">{selectedCase.location.address}</p>
                  <p className="text-xs text-slate-500 font-mono">
                    {selectedCase.location.coordinates.lat.toFixed(6)}, {selectedCase.location.coordinates.lng.toFixed(6)}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-slate-500 mb-2 flex items-center gap-2">
                  <Clock className="w-4 h-4" /> เวลาที่แจ้ง
                </h3>
                <p className="text-sm font-medium">
                  {new Date(selectedCase.reportedAt).toLocaleString("th-TH", {
                    dateStyle: "long",
                    timeStyle: "medium",
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Footer Info */}
          <div className="flex items-center justify-between pt-4 border-t text-xs text-slate-400">
            <span>Case ID: {selectedCase.id.substring(0, 8)}</span>
            {selectedCase.assignedTo && (
              <span>Assigned to: {selectedCase.assignedTo}</span>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};