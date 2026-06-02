import { notFound } from "next/navigation";
import { EnglishQuestFlow } from "@/components/student/EnglishQuestFlow";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { getCurrentProfile } from "@/lib/auth";
import { getStudentDashboard } from "@/lib/dashboard-data";
import { tasks } from "@/lib/mock-data";
import { getStudentTaskFromSupabase } from "@/lib/student-task-data";

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export default async function StudentTaskDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await getCurrentProfile().catch(() => null);
  const supabaseTask =
    profile?.role === "student" && uuidPattern.test(id)
      ? await getStudentTaskFromSupabase(profile.id, id)
      : null;
  const task = supabaseTask?.task ?? tasks.find((item) => item.id === id);
  if (!task) notFound();
  const dashboard = getStudentDashboard();

  return (
    <DashboardShell title="English Quest" immersive>
      <div className="min-h-screen bg-[#071E63] bg-[radial-gradient(circle_at_18%_8%,rgba(79,184,255,0.55),transparent_28%),radial-gradient(circle_at_82%_16%,rgba(139,56,255,0.45),transparent_24%),linear-gradient(180deg,#061956_0%,#0B2F86_48%,#142C7D_100%)] px-4 pb-28 pt-4 text-white sm:px-6 lg:p-6 lg:pb-8">
        <EnglishQuestFlow task={task} pet={dashboard.pet} />
      </div>
    </DashboardShell>
  );
}
