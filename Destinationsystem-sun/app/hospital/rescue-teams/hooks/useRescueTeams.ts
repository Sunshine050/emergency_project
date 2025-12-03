// app/shared/hooks/useRescueTeams.ts
import { useState, useEffect, useMemo } from "react";
import { useToast } from "@/shared/hooks/use-toast";
import type { ApiRescueTeam, RescueTeam } from "@/shared/types";
import { fetchRescueTeams, createRescueTeam } from "@/shared/services/rescueService";
import type { CreateRescueTeamDto } from "@/shared/services/rescueService";

/* -------------------------------------------------------------
   Mapping API → UI type
   ------------------------------------------------------------- */
const mapApiToRescueTeam = (api: ApiRescueTeam): RescueTeam => ({
  id: api.id,
  name: api.name,
  status: api.status === "ACTIVE" ? "available" : "offline",
  members: 4, // หรือดึงจาก backend
  location: {
    address: `${api.address || ''}, ${api.city || ''}, ${api.state || ''} ${api.postalCode || ''}`
      .replace(/,\s+/g, ", ")
      .trim(),
    coordinates: { lat: api.latitude ?? 0, lng: api.longitude ?? 0 },
  },
  contact: api.contactPhone,
  vehicle: (api.vehicleTypes || [])
    .map((v) => (v === "ambulance" ? "รถพยาบาล" : v === "firetruck" ? "รถดับเพลิง" : v))
    .join(", "),
  activeMission: undefined,
  lastActive: api.updatedAt,
});

/* -------------------------------------------------------------
   Hook
   ------------------------------------------------------------- */
export const useRescueTeams = () => {
  const [teams, setTeams] = useState<RescueTeam[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const loadTeams = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const apiData = await fetchRescueTeams();
      const mappedData = apiData.map(mapApiToRescueTeam);
      setTeams(mappedData);
    } catch (err: any) {
      console.error("Error loading rescue teams:", err);
      
      // ถ้าเป็น 403 Forbidden ให้แสดงข้อความเฉพาะ
      if (err.message?.includes("Forbidden") || err.message?.includes("403")) {
        setError("คุณไม่มีสิทธิ์เข้าถึงข้อมูลทีมกู้ภัย กรุณาติดต่อผู้ดูแลระบบ");
      } else {
        setError(err.message ?? "ไม่สามารถโหลดข้อมูลทีมกู้ภัยได้");
        toast({
          title: "โหลดข้อมูลทีมกู้ภัยล้มเหลว",
          description: err.message ?? "กรุณาลองใหม่อีกครั้ง",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTeams();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreateTeam = async (newTeamData: CreateRescueTeamDto) => {
    try {
      const createdApiTeam = await createRescueTeam(newTeamData);
      const mappedTeam = mapApiToRescueTeam(createdApiTeam);
      setTeams((prev) => [...prev, mappedTeam]);
      toast({ title: "สร้างทีมกู้ภัยสำเร็จ", variant: "default" });
    } catch (err: any) {
      toast({
        title: "สร้างทีมกู้ภัยล้มเหลว",
        description: err.message ?? "กรุณาลองใหม่อีกครั้ง",
        variant: "destructive",
      });
    }
  };

  const filteredTeams = useMemo(
    () =>
      teams.filter(
        (t) =>
          t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.location.address.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [teams, searchQuery]
  );

  const stats = useMemo(() => {
    const totalMembers = teams.reduce((acc, t) => acc + t.members, 0);
    return {
      total: teams.length,
      available: teams.filter((t) => t.status === "available").length,
      onMission: teams.filter((t) => t.status === "on-mission").length,
      totalMembers,
    };
  }, [teams]);

  return {
    teams: filteredTeams,
    stats,
    searchQuery,
    setSearchQuery,
    handleCreateTeam,
    loadTeams,
    isLoading,
    error,
  };
};