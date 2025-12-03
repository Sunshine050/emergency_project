// app/1669/reports/components/ReportModal.tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@components/ui/dialog";
import { Report } from "@/shared/types";
import { getLocationText, getSymptomsText } from "@/shared/utils/extractors";

interface ReportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedReport: Report | null;
}

export const ReportModal: React.FC<ReportModalProps> = ({ open, onOpenChange, selectedReport }) => {
  const symptoms = selectedReport?.details ? getSymptomsText(selectedReport.details) : "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-xl">{selectedReport?.title}</DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-6">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground font-medium">วันที่:</p>
              <p>{selectedReport && new Date(selectedReport.date).toLocaleDateString("th-TH")}</p>
            </div>
            <div>
              <p className="text-muted-foreground font-medium">ประเภท:</p>
              <p>{selectedReport?.type}</p>
            </div>
            <div>
              <p className="text-muted-foreground font-medium">ความรุนแรง:</p>
              <p>ระดับ {selectedReport?.stats.severity ?? "ไม่ระบุ"}</p>
            </div>
            <div>
              <p className="text-muted-foreground font-medium">ชื่อผู้ป่วย:</p>
              <p>{selectedReport?.stats.patientName ?? "ไม่ระบุ"}</p>
            </div>
            <div>
              <p className="text-muted-foreground font-medium">สถานะ:</p>
              <p>{selectedReport?.stats.status ?? "ไม่ระบุ"}</p>
            </div>
          </div>
          {selectedReport?.details && (
            <>
              <div>
                <p className="text-muted-foreground font-medium mb-1">คำอธิบาย:</p>
                <p className="bg-muted/50 p-3 rounded-lg">{selectedReport.details.description ?? "ไม่มี"}</p>
              </div>
              <div>
                <p className="text-muted-foreground font-medium mb-1">สถานที่:</p>
                <p className="bg-muted/50 p-3 rounded-lg">{getLocationText(selectedReport.details)}</p>
              </div>
              <div>
                <p className="text-muted-foreground font-medium mb-1">อาการ:</p>
                <p className="bg-muted/50 p-3 rounded-lg">
                  {Array.isArray(symptoms) ? symptoms.join(", ") : symptoms}
                </p>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
