import { BlindBoxZone } from "@/components/game/BlindBoxZone";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { getCurrentProfile } from "@/lib/auth";
import { getStudentDashboard, getStudentDashboardFromSupabase } from "@/lib/dashboard-data";

export default async function StudentCardsPage() {
  const profile = await getCurrentProfile().catch(() => null);
  const liveDashboard =
    profile?.role === "student" ? await getStudentDashboardFromSupabase(profile.id) : null;
  const dashboard = liveDashboard ?? getStudentDashboard();

  return (
    <DashboardShell title="Blind Box Cards" immersive>
      <div className="min-h-screen bg-[#071E63] bg-[radial-gradient(circle_at_18%_8%,rgba(79,184,255,0.55),transparent_28%),radial-gradient(circle_at_82%_16%,rgba(139,56,255,0.45),transparent_24%),linear-gradient(180deg,#061956_0%,#0B2F86_48%,#142C7D_100%)] px-4 pb-28 pt-4 text-white sm:px-6 lg:p-6 lg:pb-8">
        <BlindBoxZone coins={dashboard.student.starCoins} />
      </div>
    </DashboardShell>
  );
}
