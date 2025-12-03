// app/hospital/reports/components/HospitalReportsStatsCards.tsx
import { Card, CardHeader, CardTitle, CardContent } from "@components/ui/card";

interface HospitalReportsStats {
  totalPatients?: number;
  avgWaitTime?: number;
  criticalCases?: number;
  bedOccupancy?: number;
  bedUtilization?: number;
  staffUtilization?: number;
  equipmentUsage?: number;
  supplies?: number;
  admissions?: number;
  discharges?: number;
  transfers?: number;
  satisfaction?: number;
}

interface HospitalReportsStatsCardsProps {
  stats: HospitalReportsStats;
}

export const HospitalReportsStatsCards: React.FC<HospitalReportsStatsCardsProps> = ({ stats }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
    <Card>
      <CardHeader>
        <CardTitle>ED Wait Time</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{stats.avgWaitTime || 0} min</div>
        <p className="text-muted-foreground">Average wait time</p>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle>Bed Occupancy</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{stats.bedOccupancy || 0}%</div>
        <p className="text-muted-foreground">Current occupancy rate</p>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle>Patient Satisfaction</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{stats.satisfaction || 0}%</div>
        <p className="text-muted-foreground">Based on surveys</p>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle>Staff Utilization</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{stats.staffUtilization || 0}%</div>
        <p className="text-muted-foreground">Resource efficiency</p>
      </CardContent>
    </Card>
  </div>
);