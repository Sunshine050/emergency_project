// app/hospital/cases/components/TransferToRescueDialog.tsx
"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@components/ui/dialog";
import { Button } from "@components/ui/button";
import { Badge } from "@components/ui/badge";
import { Card, CardContent } from "@components/ui/card";
import { Loader2, Users, MapPin, Phone, Truck, CheckCircle2 } from "lucide-react";
import { ApiRescueTeam } from "@/shared/types";
import { fetchRescueTeams } from "@/shared/services/rescueService";
import { useToast } from "@/shared/hooks/use-toast";
import { cn } from "@lib/utils";

interface TransferToRescueDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  caseId: string;
  onTransfer: (caseId: string, teamId: string, teamName: string) => Promise<void>;
}

export const TransferToRescueDialog: React.FC<TransferToRescueDialogProps> = ({
  open,
  onOpenChange,
  caseId,
  onTransfer,
}) => {
  const [teams, setTeams] = useState<ApiRescueTeam[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTeam, setSelectedTeam] = useState<ApiRescueTeam | null>(null);
  const [transferring, setTransferring] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      loadTeams();
    }
  }, [open]);

  const loadTeams = async () => {
    try {
      setLoading(true);
      const data = await fetchRescueTeams();
      // Filter only available teams
      const availableTeams = data.filter(
        (team) => team.status === "AVAILABLE" || team.status === "ACTIVE"
      );
      setTeams(availableTeams);
    } catch (error: any) {
      toast({
        title: "ไม่สามารถโหลดข้อมูลทีมกู้ภัย",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTransfer = async () => {
    if (!selectedTeam) return;

    try {
      setTransferring(true);
      await onTransfer(caseId, selectedTeam.id, selectedTeam.name);
      onOpenChange(false);
      setSelectedTeam(null);
    } catch (error) {
      // Error handling is done in parent
    } finally {
      setTransferring(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      AVAILABLE: { label: "พร้อมปฏิบัติงาน", className: "bg-green-500 hover:bg-green-600" },
      ACTIVE: { label: "ปฏิบัติงานอยู่", className: "bg-blue-500 hover:bg-blue-600" },
      BUSY: { label: "ไม่ว่าง", className: "bg-orange-500 hover:bg-orange-600" },
      OFF_DUTY: { label: "ปิดปฏิบัติการ", className: "bg-gray-500 hover:bg-gray-600" },
      MAINTENANCE: { label: "ซ่อมบำรุง", className: "bg-yellow-500 hover:bg-yellow-600" },
      INACTIVE: { label: "ไม่ทำงาน", className: "bg-red-500 hover:bg-red-600" },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.INACTIVE;
    return (
      <Badge className={cn("text-white border-0", config.className)}>
        {config.label}
      </Badge>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Truck className="h-5 w-5 text-blue-600" />
            มอบหมายเคสให้ทีมกู้ภัย
          </DialogTitle>
          <DialogDescription>
            เลือกทีมกู้ภัยที่มีความพร้อมในการรับเคสนี้
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-blue-600" />
                <p className="text-sm text-slate-500">กำลังโหลดข้อมูลทีมกู้ภัย...</p>
              </div>
            </div>
          ) : teams.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 dark:bg-slate-900/50 rounded-lg border-2 border-dashed">
              <Users className="h-12 w-12 mx-auto mb-3 text-slate-400" />
              <p className="text-slate-600 dark:text-slate-400 font-medium">
                ไม่พบทีมกู้ภัยที่พร้อมปฏิบัติงาน
              </p>
              <p className="text-sm text-slate-500 mt-1">
                กรุณาลองใหม่อีกครั้งในภายหลัง
              </p>
            </div>
          ) : (
            <div className="grid gap-3">
              {teams.map((team) => (
                <Card
                  key={team.id}
                  className={cn(
                    "cursor-pointer transition-all hover:shadow-md",
                    selectedTeam?.id === team.id
                      ? "border-2 border-blue-500 bg-blue-50 dark:bg-blue-950/20"
                      : "border hover:border-slate-300 dark:hover:border-slate-600"
                  )}
                  onClick={() => setSelectedTeam(team)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-lg">{team.name}</h3>
                          {getStatusBadge(team.status)}
                          {selectedTeam?.id === team.id && (
                            <CheckCircle2 className="h-5 w-5 text-blue-600" />
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                            <MapPin className="h-4 w-4" />
                            <span>{team.address}, {team.city}</span>
                          </div>
                          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                            <Phone className="h-4 w-4" />
                            <span>{team.contactPhone}</span>
                          </div>
                        </div>

                        {team.vehicleTypes && team.vehicleTypes.length > 0 && (
                          <div className="flex items-center gap-2">
                            <Truck className="h-4 w-4 text-slate-500" />
                            <div className="flex flex-wrap gap-1">
                              {team.vehicleTypes.map((vehicle, idx) => (
                                <Badge key={idx} variant="secondary" className="text-xs">
                                  {vehicle}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              setSelectedTeam(null);
            }}
            disabled={transferring}
          >
            ยกเลิก
          </Button>
          <Button
            onClick={handleTransfer}
            disabled={!selectedTeam || transferring}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {transferring ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                กำลังมอบหมาย...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                มอบหมายเคส
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
