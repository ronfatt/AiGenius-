import { PetExplorationPanel } from "@/components/game/PetExplorationPanel";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { getStudentDashboard } from "@/lib/dashboard-data";

export default function StudentExplorePage() {
  const dashboard = getStudentDashboard();

  return (
    <DashboardShell title="Pet Exploration">
      <PetExplorationPanel pet={dashboard.pet} />
    </DashboardShell>
  );
}
