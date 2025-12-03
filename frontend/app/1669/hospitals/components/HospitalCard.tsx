// app/1669/hospitals/components/HospitalCard.tsx
import { Card, CardContent, CardHeader } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Badge } from "@components/ui/badge";
import { Building2, Phone, MapPin, Bed, Activity, Mail, Clock, MoreHorizontal } from "lucide-react";
import { Loader2 } from "lucide-react";
import { Hospital } from "@/shared/types";
import { statusColors, getCaseStatusLabel } from "@/shared/utils/statusUtils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@components/ui/dropdown-menu";

interface HospitalCardProps {
  hospital: Hospital;
  onContact: (hospital: Hospital) => void;
}

export const HospitalCard: React.FC<HospitalCardProps> = ({
  hospital,
  onContact,
}) => {
  const isAvailable = (hospital.availableBeds ?? 0) > 0;

  return (
    <Card className="group overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-200">
      {/* Header Section */}
      <div className="p-4 flex items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="flex gap-3">
          <div className="h-10 w-10 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-sm">
            <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white leading-tight">
              {hospital.name}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <Badge 
                variant="secondary" 
                className={`text-[10px] px-1.5 py-0 h-5 font-medium ${statusColors[hospital.status ?? "UNKNOWN"]}`}
              >
                {getCaseStatusLabel(hospital.status ?? "")}
              </Badge>
              <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {hospital.city || "ไม่ระบุเมือง"}
              </span>
            </div>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-600">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onContact(hospital)}>
              <Phone className="h-4 w-4 mr-2" />
              ติดต่อ
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <CardContent className="p-4 space-y-4">
        {/* Address */}
        <div className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          {hospital.address || "ไม่ระบุที่อยู่"}
          {hospital.postalCode && <span className="text-slate-400 ml-1">({hospital.postalCode})</span>}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className={`p-3 rounded-lg border ${isAvailable ? 'bg-green-50 border-green-100 dark:bg-green-900/10 dark:border-green-900/30' : 'bg-slate-50 border-slate-100'}`}>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1">
              <Bed className="h-3 w-3" /> เตียงว่าง
            </div>
            <div className={`text-lg font-bold ${isAvailable ? 'text-green-700 dark:text-green-400' : 'text-slate-700'}`}>
              {hospital.availableBeds ?? 0}
            </div>
          </div>
          
          <div className="p-3 rounded-lg border bg-slate-50 border-slate-100 dark:bg-slate-800/50 dark:border-slate-700">
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1">
              <Activity className="h-3 w-3" /> ความจุ ICU
            </div>
            <div className="text-lg font-bold text-slate-700 dark:text-slate-300">
              {hospital.medicalInfo?.capacity?.icuBeds ? 
                `${hospital.medicalInfo.capacity.availableIcuBeds ?? 0}/${hospital.medicalInfo.capacity.icuBeds}` : 
                'N/A'
              }
            </div>
          </div>
        </div>

        {/* Contact Actions */}
        <div className="flex gap-2 pt-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 h-9 text-xs border-slate-200 hover:bg-slate-50 hover:text-blue-600"
            onClick={() => onContact(hospital)}
          >
            <Phone className="h-3.5 w-3.5 mr-2" />
            {hospital.contactPhone || "ไม่มีเบอร์"}
          </Button>
          
          {hospital.contactEmail && (
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1 h-9 text-xs border-slate-200 hover:bg-slate-50 hover:text-blue-600"
              onClick={() => window.open(`mailto:${hospital.contactEmail}`, "_blank")}
            >
              <Mail className="h-3.5 w-3.5 mr-2" />
              อีเมล
            </Button>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            อัปเดตล่าสุด: {hospital.updatedAt ? new Date(hospital.updatedAt).toLocaleDateString("th-TH") : "-"}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};
