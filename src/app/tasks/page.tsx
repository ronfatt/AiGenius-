import { TaskCard } from "@/components/cards/TaskCard";
import { StatCard } from "@/components/cards/StatCard";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { tasks } from "@/lib/mock-data";

export default function TasksPage() {
  const submittedCount = tasks.filter((task) => task.status === "submitted").length;
  const reviewedCount = tasks.filter((task) => task.status === "reviewed").length;

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
    </DashboardShell>
  );
}
