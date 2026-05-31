import { notFound } from "next/navigation";
import { EnglishQuestFlow } from "@/components/student/EnglishQuestFlow";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { getStudentDashboard } from "@/lib/dashboard-data";
import { tasks } from "@/lib/mock-data";

export default async function StudentTaskDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const task = tasks.find((item) => item.id === id);
  if (!task) notFound();

  const dashboard = getStudentDashboard();

  return (
    <DashboardShell title="English Quest">
      <EnglishQuestFlow task={task} pet={dashboard.pet} />
    </DashboardShell>
  );
}
