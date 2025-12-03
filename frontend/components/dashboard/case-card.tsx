"use client";

import { useState, useEffect } from "react";
import {
  AlertTriangle,
  Clock,
  MapPin,
  Phone,
  User,
  Calendar,
  ChevronsRight,
} from "lucide-react";
import { Button } from "@components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@components/ui/card";
import { Badge } from "@components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@components/ui/dialog";
import { Separator } from "@components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@components/ui/select";
import { useToast } from "@/shared/hooks/use-toast";
import { cn } from "@lib/utils";

interface CaseCardProps {
  id: string;
  description: string;
  descriptionFull?: string;
  status: "pending" | "assigned" | "in-progress" | "completed" | "cancelled";
  grade: "CRITICAL" | "URGENT" | "NON_URGENT" | "UNKNOWN";
  severity?: 1 | 2 | 3 | 4;
  onTransfer?: () => void;
  onCancel?: () => void;
  reportedAt: string;
  patientName: string;
  contactNumber: string;
  emergencyType: string;
  location: {
    address: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  assignedTo?: string;
  notes?: string;
  symptoms?: string[] | null;
  role: "emergency-center" | "hospital" | "rescue";
  setCases: React.Dispatch<React.SetStateAction<any[]>>;
  fetchHospitals: () => Promise<any[]>;
}



interface Hospital {
  id: string;
  name: string;
  availableBeds: number | null;
}

export default function CaseCard({
  id,
  description,
  descriptionFull = description,
  status,
  grade,
  reportedAt,
  patientName,
  contactNumber,
  emergencyType,
  location,
  assignedTo,
  notes,
  symptoms = [],
  role,
  setCases,
  fetchHospitals,
}: CaseCardProps) {
  const { toast } = useToast();
  const [selectedHospital, setSelectedHospital] = useState<string>("");
  const [hospitals, setHospitals] = useState<Hospital[]>([]);

  // Normalize status to lowercase string to keep consistent style
  const normalizedStatus = status.toLowerCase() as
    | "pending"
    | "assigned"
    | "in-progress"
    | "completed"
    | "cancelled";

  // Load hospitals list on mount or when fetchHospitals changes
  useEffect(() => {
    const loadHospitals = async () => {
      try {
        const data = await fetchHospitals();
        setHospitals(
          data.map((h: any) => ({
            id: h.id,
            name: h.name || "โรงพยาบาลไม่มีชื่อ",
            availableBeds: h.availableBeds ?? 0,
          }))
        );
      } catch (error) {
        console.error("Error fetching hospitals:", error);
        toast({
          title: "ข้อผิดพลาด",
          description: "ไม่สามารถดึงข้อมูลโรงพยาบาลได้",
          variant: "destructive",
        });
      }
    };
    loadHospitals();
  }, [fetchHospitals, toast]);

  // Handler to assign case to selected hospital
  const handleAssign = async () => {
    if (!selectedHospital) {
      toast({
        title: "ข้อผิดพลาด",
        description: "กรุณาเลือกโรงพยาบาล",
        variant: "destructive",
      });
      return;
    }

    try {
      const token = localStorage.getItem("access_token");
      if (!token) throw new Error("No access token");

      const hospital = hospitals.find((h) => h.id === selectedHospital);
      if (!hospital) throw new Error("Hospital not found");

      if (hospital.availableBeds === null || hospital.availableBeds <= 0) {
        throw new Error("ไม่มีเตียงว่างในโรงพยาบาลที่เลือก");
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/sos/${id}/assign`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ hospitalId: selectedHospital }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `ไม่สามารถมอบหมายเคสได้: ${response.statusText} (${response.status}) - ${errorText}`
        );
      }

      toast({
        title: "มอบหมายเคสสำเร็จ",
        description: `เคส ${id.slice(-8)} ถูกมอบหมายให้ ${hospital.name}`,
      });

      // รีเฟรชข้อมูลเคสและโรงพยาบาล
      const fetchData = async () => {
        try {
          const token = localStorage.getItem("access_token");
          if (!token) throw new Error("No access token");

          const emergenciesRes = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/dashboard/active-emergencies`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          if (!emergenciesRes.ok)
            throw new Error(
              `ไม่สามารถดึงข้อมูลเคสได้: ${emergenciesRes.statusText}`
            );

          const emergenciesData = await emergenciesRes.json();

          const updatedCases = emergenciesData.map((item: any) => ({
            id: item.id || "unknown-id",
            description:
              (item.description || "ไม่มีรายละเอียด").slice(0, 50) + "...",
            descriptionFull: item.description || "ไม่มีรายละเอียด",
            status: item.status?.toLowerCase() || "pending",
            grade:
              (item.medicalInfo?.grade ||
                item.grade ||
                "NON_URGENT").toUpperCase() as
                | "CRITICAL"
                | "URGENT"
                | "NON_URGENT"
                | "UNKNOWN",
            reportedAt: item.createdAt || new Date().toISOString(),
            patientName:
              `${item.patient?.firstName || ""} ${
                item.patient?.lastName || ""
              }`.trim() || "ไม่ทราบชื่อ",
            contactNumber: item.patient?.phone || "N/A",
            emergencyType: item.type || "OTHER",
            location: {
              address: item.location || "ไม่ทราบสถานที่",
              coordinates: {
                lat: item.latitude || 0,
                lng: item.longitude || 0,
              },
            },
            assignedTo: item.responses?.[0]?.organization?.name || undefined,
            symptoms: Array.isArray(item.medicalInfo?.symptoms)
              ? item.medicalInfo.symptoms
              : [],
            notes: item.notes || undefined,
          }));

          setCases(updatedCases);

          // รีเฟรชโรงพยาบาล
          await fetchHospitals();
        } catch (error) {
          console.error("Error refreshing data:", error);
          toast({
            title: "ข้อผิดพลาด",
            description: "ไม่สามารถรีเฟรชข้อมูลได้",
            variant: "destructive",
          });
        }
      };

      await fetchData();
    } catch (error: any) {
      console.error("Error assigning case:", error);
      toast({
        title: "ข้อผิดพลาด",
        description: `ไม่สามารถมอบหมายเคสได้: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  // Helpers for UI colors based on status and grade
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-500";
      case "assigned":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-500";
      case "in-progress":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-500";
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500";
      case "cancelled":
        return "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400";
      default:
        return "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400";
    }
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case "CRITICAL":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-500";
      case "URGENT":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-500";
      case "NON_URGENT":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500";
      default:
        return "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return "Pending";
      case "assigned":
        return "Assigned";
      case "in-progress":
        return "In Progress";
      case "completed":
        return "Completed";
      case "cancelled":
        return "Cancelled";
      default:
        return "Unknown";
    }
  };

  // Safe symptoms array
  const safeSymptoms = Array.isArray(symptoms) ? symptoms : [];

  // Format reported date
  const reportedDate = new Date(reportedAt);
  const formattedDate = !isNaN(reportedDate.getTime())
    ? reportedDate.toLocaleString("th-TH")
    : "Unknown date";

  return (
    <Card className="overflow-hidden transition-all duration-200">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2 mb-1">
              <AlertTriangle
                className={cn(
                  "h-4 w-4",
                  grade === "CRITICAL" && "text-red-500"
                )}
              />
              {description}
            </CardTitle>
            <CardDescription>Case ID: {id}</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={getGradeColor(grade)}>{grade || "UNKNOWN"}</Badge>
            <Badge className={getStatusColor(normalizedStatus)}>
              {getStatusLabel(normalizedStatus)}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="space-y-2 mb-3">
          <div className="flex items-center text-sm text-slate-500 dark:text-slate-400">
            <Calendar className="mr-2 h-4 w-4" />
            <span>Reported on {formattedDate}</span>
          </div>
          <div className="flex items-center text-sm text-slate-500 dark:text-slate-400">
            <User className="mr-2 h-4 w-4" />
            <span>{patientName}</span>
          </div>
          <div className="flex items-center text-sm text-slate-500 dark:text-slate-400">
            <Phone className="mr-2 h-4 w-4" />
            <span>{contactNumber || "N/A"}</span>
          </div>
          <div className="flex items-center text-sm text-slate-500 dark:text-slate-400">
            <MapPin className="mr-2 h-4 w-4" />
            <span>{location.address}</span>
          </div>
        </div>

        {/* เฉพาะ emergency-center และ status pending ถึงแสดง Select กับปุ่มมอบหมาย */}
        {role === "emergency-center" && normalizedStatus === "pending" && (
          <div className="flex gap-2 items-center mt-4">
            <Select
              value={selectedHospital}
              onValueChange={setSelectedHospital}
              aria-label="Select hospital"
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="เลือกโรงพยาบาล" />
              </SelectTrigger>
              <SelectContent>
                {hospitals.map((hospital) => (
                  <SelectItem
                    key={hospital.id}
                    value={hospital.id}
                    disabled={
                      hospital.availableBeds === null ||
                      hospital.availableBeds <= 0
                    }
                  >
                    {hospital.name} ({hospital.availableBeds || 0} เตียง)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              size="sm"
              onClick={handleAssign}
              disabled={!selectedHospital}
              aria-disabled={!selectedHospital}
            >
              มอบหมาย
            </Button>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between pt-0">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="ml-auto">
              <ChevronsRight className="h-4 w-4 mr-1" />
              View Details
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle
                  className={cn(
                    "h-5 w-5",
                    grade === "CRITICAL" && "text-red-500"
                  )}
                />
                {descriptionFull}
              </DialogTitle>
              <DialogDescription>Case ID: {id}</DialogDescription>
            </DialogHeader>

            <div className="space-y-4 max-h-[60vh] overflow-y-auto py-2">
              <div className="flex gap-2">
                <Badge className={getGradeColor(grade)}>
                  {grade || "UNKNOWN"}
                </Badge>
                <Badge className={getStatusColor(normalizedStatus)}>
                  {getStatusLabel(normalizedStatus)}
                </Badge>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Patient Information</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center">
                    <User className="mr-2 h-4 w-4 text-slate-500" />
                    <span>Name: {patientName}</span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="mr-2 h-4 w-4 text-slate-500" />
                    <span>Contact: {contactNumber || "N/A"}</span>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <p className="text-sm font-medium">Incident Details</p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start">
                    <AlertTriangle className="mr-2 h-4 w-4 text-slate-500 mt-0.5" />
                    <span>
                      <strong>Emergency Type:</strong> {emergencyType}
                    </span>
                  </div>
                  <div className="flex items-start">
                    <Clock className="mr-2 h-4 w-4 text-slate-500 mt-0.5" />
                    <span>
                      <strong>Reported:</strong> {formattedDate}
                    </span>
                  </div>
                  <div className="flex items-start">
                    <MapPin className="mr-2 h-4 w-4 text-slate-500 mt-0.5" />
                    <span>
                      <strong>Location:</strong>
                      <br />
                      {location.address}
                      <br />
                      Coordinates: {location.coordinates.lat},{" "}
                      {location.coordinates.lng}
                    </span>
                  </div>
                </div>
              </div>

              {(notes || safeSymptoms.length > 0) && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Medical Information</p>
                    {notes && (
                      <div className="text-sm">
                        <strong>Notes:</strong>
                        <p className="mt-1">{notes}</p>
                      </div>
                    )}
                    {safeSymptoms.length > 0 && (
                      <div className="text-sm">
                        <strong>Symptoms:</strong>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {safeSymptoms.map((symptom, index) => (
                            <Badge key={index} variant="outline">
                              {symptom}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}

              {assignedTo && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Assignment Information</p>
                    <div className="text-sm">
                      <strong>Assigned To:</strong> {assignedTo}
                    </div>
                  </div>
                </>
              )}
            </div>

            <DialogFooter className="flex justify-end sm:justify-end">
              {/* ถ้าต้องการใส่ปุ่มเพิ่มเติมใน Dialog Footer สามารถเพิ่มตรงนี้ */}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
}
