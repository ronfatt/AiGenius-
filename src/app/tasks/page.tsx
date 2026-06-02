import { TaskCard } from "@/components/cards/TaskCard";
import { StatCard } from "@/components/cards/StatCard";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { getCurrentProfile } from "@/lib/auth";
import { getLiveWorkspaceData } from "@/lib/workspace-data";
import { redirect } from "next/navigation";

export default async function TasksPage() {
  const profile = await getCurrentProfile();

  if (!profile || (profile.role !== "teacher" && profile.role !== "admin")) {
    redirect("/login?error=Please%20login%20as%20teacher%20or%20admin.");
  }

  const data = await getLiveWorkspaceData(profile);
  const tasks = data?.tasks ?? [];
  const taskIds = new Set(tasks.map((task) => task.id));
  const submittedCount = (data?.submissions ?? []).filter(
    (submission) => taskIds.has(submission.task_id) && submission.status === "submitted",
  ).length;
  const reviewedCount = (data?.submissions ?? []).filter(
    (submission) => taskIds.has(submission.task_id) && submission.status === "reviewed",
  ).length;

  return (
    <DashboardShell title="Task Assignment" variant="teacher">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Open tasks" value={tasks.length} />
        <StatCard label="Submitted" value={submittedCount} />
        <StatCard label="Reviewed" value={reviewedCount} />
      </div>
      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>
      {!tasks.length ? (
        <section className="mt-5 rounded-[1.5rem] border-2 border-[#102A54] bg-[#FFFEF8] p-5 text-[#102A54]">
          <h2 className="text-xl font-black">No live tasks yet</h2>
          <p className="mt-2 text-sm font-bold text-[#102A54]/65">
            Use Teacher Task Planner to generate and publish English tasks to Supabase.
          </p>
        </section>
      ) : null}
    </DashboardShell>
  );
}
