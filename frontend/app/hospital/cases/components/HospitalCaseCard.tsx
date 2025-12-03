// app/hospital/cases/components/HospitalCaseCard.tsx
// Hospital-specific card (transfer to rescue only)
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Badge } from "@components/ui/badge";
import { User, Phone, MapPin, Clock, Truck } from "lucide-react";
import { cn } from "@lib/utils";
import { EmergencyCase } from "@/shared/types";
import { statusColors, severityColors } from "@/shared/utils/statusUtils";

interface HospitalCaseCardProps extends EmergencyCase {
  onTransfer: (id: string) => void;
}

export const HospitalCaseCard: React.FC<HospitalCaseCardProps> = ({ 
  id, 
  description, 
  status, 
  severity, 
  reportedAt, 
  patientName, 
  contactNumber, 
  emergencyType, 
  location, 
  assignedTo, 
  symptoms, 
  onTransfer 
}) => (
  <Card className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-200 group">
    <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 rounded-t-xl">
      <div className="flex justify-between items-start">
        <div>
          <CardTitle className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            Case #{id.slice(-8)}
            {severity >= 3 && <span className="flex h-2 w-2 rounded-full bg-red-500 animate-pulse" />}
          </CardTitle>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {new Date(reportedAt).toLocaleString("th-TH")}
          </p>
        </div>
        <Badge className={cn("text-xs font-semibold px-2.5 py-0.5 rounded-full capitalize shadow-none", statusColors[status])}>
          {status.replace('-', ' ')}
        </Badge>
      </div>
    </CardHeader>
    <CardContent className="p-4 space-y-4">
      <div className="grid grid-cols-1 gap-3">
        <div className="flex items-start gap-3">
          <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-full shrink-0">
            <User className="h-4 w-4 text-slate-600 dark:text-slate-400" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Patient</p>
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-200">{patientName}</p>
            <p className="text-xs text-slate-500 mt-0.5">{contactNumber}</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-full shrink-0">
            <MapPin className="h-4 w-4 text-slate-600 dark:text-slate-400" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Location</p>
            <p className="text-sm text-slate-700 dark:text-slate-300 line-clamp-2 leading-relaxed">{location.address}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 pt-2">
        <div className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
          <p className="text-xs text-slate-500 mb-1">Type</p>
          <p className="text-sm font-medium text-slate-900 dark:text-slate-200">{emergencyType}</p>
        </div>
        <div className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
          <p className="text-xs text-slate-500 mb-1">Severity</p>
          <Badge className={cn("text-[10px] px-2 py-0 h-5 shadow-none", severityColors[severity])}>
            Level {severity}
          </Badge>
        </div>
      </div>

      {description && (
        <div className="pt-2">
          <p className="text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wide">Description</p>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-2 bg-slate-50 dark:bg-slate-800/30 p-3 rounded-lg border border-slate-100 dark:border-slate-800 italic">
            "{description}"
          </p>
        </div>
      )}

      {symptoms.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {symptoms.map((symptom, index) => (
            <span key={index} className="text-[10px] font-medium px-2 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-600 dark:text-slate-400">
              {symptom}
            </span>
          ))}
        </div>
      )}

      {status === "assigned" && (
        <Button 
          variant="default" 
          className="w-full mt-4 bg-slate-900 hover:bg-slate-800 text-white shadow-sm h-10 rounded-lg group-hover:bg-blue-600 transition-colors" 
          onClick={() => onTransfer(id)}
        >
          <Truck className="h-4 w-4 mr-2" />
          Assign to Rescue Team
        </Button>
      )}
    </CardContent>
  </Card>
);