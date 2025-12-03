// app/shared/utils/dashboardUtils.ts
// Helpers for dashboard processing (pure, reusable in reports)
import { EmergencyCase, MonthlyTrendData } from "../../shared/types";

export const processCaseDataForCharts = (cases: EmergencyCase[], period: string): MonthlyTrendData[] => {
  const months: { [key: string]: MonthlyTrendData } = {};
  const now = new Date();
  const startDate = new Date();
  startDate.setMonth(now.getMonth() - (period === "12-months" ? 11 : period === "6-months" ? 5 : 23));

  cases.forEach((caseItem) => {
    const caseDate = new Date(caseItem.reportedAt);
    if (caseDate >= startDate) {
      const monthKey = caseDate.toLocaleString("en-US", { month: "short", year: "numeric" });

      if (!months[monthKey]) {
        months[monthKey] = {
          month: monthKey,
          admissions: 0,
          readmissions: 0,
          inpatient: 0,
          outpatient: 0,
          critical: 0,
          urgent: 0,
          nonUrgent: 0,
        };
      }

      months[monthKey].admissions += 1;
      if (caseItem.status === "completed" && caseItem.assignedTo) {
        months[monthKey].readmissions += 1;
      }
      if (caseItem.grade === "CRITICAL") {
        months[monthKey].inpatient += 1;
        months[monthKey].critical += 1;
      } else if (caseItem.grade === "URGENT") {
        months[monthKey].outpatient += 1;
        months[monthKey].urgent += 1;
      } else {
        months[monthKey].outpatient += 1;
        months[monthKey].nonUrgent += 1;
      }
    }
  });

  return Object.values(months).sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());
};