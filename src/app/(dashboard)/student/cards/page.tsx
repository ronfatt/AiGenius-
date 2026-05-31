import { BlindBoxZone } from "@/components/game/BlindBoxZone";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { getStudentDashboard } from "@/lib/dashboard-data";

export default function StudentCardsPage() {
  const dashboard = getStudentDashboard();

  return (
    <DashboardShell title="Blind Box Cards">
      <BlindBoxZone cards={dashboard.cards} coins={dashboard.student.starCoins} />
    </DashboardShell>
  );
}
