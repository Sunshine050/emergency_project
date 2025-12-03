// app/hospital/rescue-teams/components/RescueTeamCard.tsx
import { Card, CardHeader, CardTitle, CardContent } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Badge } from "@components/ui/badge";
import { Ambulance, Users, Phone, MapPin, Clock } from "lucide-react";
import { RescueTeam } from "@/shared/types";
import { getStatusColor, getStatusLabel } from "@/shared/utils/statusUtils";

interface RescueTeamCardProps {
  team: RescueTeam;
}

export const RescueTeamCard: React.FC<RescueTeamCardProps> = ({ team }) => (
  <Card className="overflow-hidden">
    <CardHeader className="pb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-full">
            <Ambulance className="h-5 w-5 text-slate-600 dark:text-slate-400" />
          </div>
          <div>
            <CardTitle className="text-lg">{team.name}</CardTitle>
            <p className="text-sm text-slate-500">{team.id}</p>
          </div>
        </div>
        <Badge className={getStatusColor(team.status)}>
          {getStatusLabel(team.status)}
        </Badge>
      </div>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <p className="text-sm text-slate-500 flex items-center gap-1">
            <Users className="h-4 w-4" />
            Team Members
          </p>
          <p className="font-medium">{team.members} members</p>
        </div>
        <div className="space-y-1">
          <p className="text-sm text-slate-500 flex items-center gap-1">
            <Phone className="h-4 w-4" />
            Contact
          </p>
          <p className="font-medium">{team.contact}</p>
        </div>
      </div>

      <div className="space-y-1">
        <p className="text-sm text-slate-500 flex items-center gap-1">
          <MapPin className="h-4 w-4" />
          Location
        </p>
        <p className="font-medium">{team.location?.address ?? "ไม่พบที่อยู่"}</p>
      </div>

      <div className="space-y-1">
        <p className="text-sm text-slate-500">Vehicle</p>
        <p className="font-medium">{team.vehicle}</p>
      </div>

      {team.activeMission && (
        <div className="space-y-1">
          <p className="text-sm text-slate-500">Active Mission</p>
          <p className="font-medium">Case #{team.activeMission}</p>
        </div>
      )}

      <div className="pt-4 flex justify-between items-center border-t border-slate-200 dark:border-slate-700">
        <p className="text-sm text-slate-500">
          Last active: {team.lastActive ? new Date(team.lastActive).toLocaleString("th-TH") : "ไม่พบข้อมูล"}
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            if (team.contact) {
              window.location.href = `tel:${team.contact}`;
            }
          }}
          className="transition-all hover:bg-slate-100 dark:hover:bg-slate-700"
        >
          Contact Team
        </Button>
      </div>
    </CardContent>
  </Card>
);