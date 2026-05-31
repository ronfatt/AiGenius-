import { PetExplorationPanel } from "@/components/game/PetExplorationPanel";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { getStudentDashboard } from "@/lib/dashboard-data";

export default function StudentExplorePage() {
  const dashboard = getStudentDashboard();

  return (
    <DashboardShell title="Pet Exploration" immersive>
      <div className="min-h-screen bg-[#071E63] bg-[radial-gradient(circle_at_18%_8%,rgba(79,184,255,0.55),transparent_28%),radial-gradient(circle_at_82%_16%,rgba(139,56,255,0.45),transparent_24%),linear-gradient(180deg,#061956_0%,#0B2F86_48%,#142C7D_100%)] px-4 pb-28 pt-4 text-white sm:px-6 lg:p-6 lg:pb-8">
        <PetExplorationPanel pet={dashboard.pet} />
      </div>
    </DashboardShell>
  );
}
