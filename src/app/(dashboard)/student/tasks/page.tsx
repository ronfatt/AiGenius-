import Link from "next/link";
import { TaskCard } from "@/components/cards/TaskCard";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Card, StatCard } from "@/components/ui";
import { getStudentDashboard } from "@/lib/dashboard-data";

export default function StudentTasksPage() {
  const dashboard = getStudentDashboard();

  return (
    <DashboardShell title="Student English Quests">
      <section className="mb-5 rounded-[2rem] border-4 border-[#102A54] bg-[#FFFEF8] p-5 shadow-[8px_8px_0_rgba(16,42,84,0.12)]">
        <p className="inline-flex rounded-full border-2 border-[#102A54] bg-[#FFD95A] px-3 py-1 text-xs font-black uppercase tracking-[0.16em]">
          Student quest flow
        </p>
        <h1 className="mt-3 text-4xl font-black text-[#102A54]">English Quests</h1>
        <p className="mt-2 text-sm font-bold text-[#102A54]/65">
          Complete reading, grammar, and vocabulary quests to earn rewards and grow your pet.
        </p>
      </section>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard value={dashboard.tasks.length.toString()} label="Open quests" />
        <StatCard value={dashboard.cefrTarget} label="CEFR target" />
        <StatCard value={dashboard.student.starCoins.toString()} label="Star Coins" />
      </div>

      <Card className="mt-4">
        <div className="grid gap-4 lg:grid-cols-2">
          {dashboard.tasks.map((task) => (
            <Link key={task.id} href={`/student/tasks/${task.id}`} className="block transition hover:-translate-y-1">
              <TaskCard task={task} />
            </Link>
          ))}
        </div>
      </Card>
    </DashboardShell>
  );
}
