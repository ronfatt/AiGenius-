import { ProgressChart } from "@/components/charts/ProgressChart";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { ActionButton, Card, ListRow, StatCard } from "@/components/ui";
import { getAdminDashboard, getClassTeacherName } from "@/lib/dashboard-data";

export default function AdminDashboard() {
  const dashboard = getAdminDashboard();
  const healthItems = [
    ["Auth", "Ready for Supabase", "OK"],
    ["Database", "Mock data active", "Mock"],
    ["Storage", "Pet and card image paths prepared", "Next"],
  ];

  return (
    <DashboardShell title="Admin Dashboard">
      <section className="mb-5 rounded-[2rem] border-4 border-[#102A54] bg-gradient-to-br from-[#FFF7E2] via-[#FFFEF8] to-[#EEF2F5] p-5 text-[#102A54] shadow-[8px_8px_0_rgba(16,42,84,0.16)]">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <p className="inline-flex rounded-full border-2 border-[#102A54] bg-[#4FB8FF] px-3 py-1 text-xs font-black uppercase tracking-[0.16em]">
              Centre operations
            </p>
            <h2 className="mt-3 text-3xl font-black sm:text-5xl">
              {dashboard.centreName}
            </h2>
            <p className="mt-3 max-w-2xl text-sm font-bold leading-6 text-[#102A54]/65">
              Monitor classes, users, rewards, learning activity, and MVP system
              readiness from one command centre.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <ActionButton>New class</ActionButton>
            <ActionButton tone="gold">Create reward</ActionButton>
          </div>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard value={dashboard.summary.studentCount.toString()} label="Total students" />
        <StatCard value={dashboard.summary.classCount.toString()} label="Active classes" />
        <StatCard value={dashboard.summary.teacherCount.toString()} label="Teachers" />
        <StatCard
          value={dashboard.summary.totalRewardsIssued.toString()}
          label="Rewards issued"
        />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <Card>
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black">Monthly learning activity</h2>
            <span className="rounded-full border-2 border-[#102A54] bg-[#FFD95A] px-3 py-1 text-xs font-black text-[#102A54]">
              {dashboard.summary.monthlyLearningActivity} events
            </span>
          </div>
          <div className="mt-5 grid gap-5">
            <ProgressChart
              label="Homework completion"
              value={dashboard.summary.averageHomework}
            />
            <ProgressChart
              label="Attendance"
              value={dashboard.summary.averageAttendance}
            />
            <ProgressChart
              label="Reward engagement"
              value={dashboard.summary.rewardEngagement}
            />
          </div>
        </Card>

        <Card>
          <h2 className="text-2xl font-black">System health</h2>
          <div className="mt-4 grid gap-3">
            {healthItems.map(([title, meta, badge]) => (
              <ListRow key={title} title={title} meta={meta} badge={badge} />
            ))}
          </div>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <Card>
          <h2 className="text-2xl font-black">Active classes</h2>
          <div className="mt-4 grid gap-3">
            {dashboard.classrooms.map((classroom) => (
              <ListRow
                key={classroom.id}
                title={classroom.name}
                meta={`${getClassTeacherName(classroom)} · ${classroom.studentIds.length} students`}
                badge={classroom.grade}
              />
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="text-2xl font-black">MVP modules</h2>
          <div className="mt-4 grid gap-3">
            <ListRow title="Tasks" meta={`${dashboard.tasks.length} learning tasks`} badge="Live" />
            <ListRow title="Pets" meta={`${dashboard.pets.length} student pets`} badge="Game" />
            <ListRow title="Cards" meta={`${dashboard.cards.length} pet cards`} badge="Draw" />
            <ListRow title="Battles" meta={`${dashboard.battles.length} quiz battle`} badge="Quiz" />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-[#FFF7E2] to-[#7BE0C3]/35">
          <p className="text-sm font-black text-[#FF6B57]">Subscription placeholder</p>
          <h2 className="mt-2 text-3xl font-black text-[#102A54]">MVP Plan</h2>
          <p className="mt-3 text-sm font-bold leading-6 text-[#102A54]/65">
            Billing is not connected yet. This panel is reserved for centre
            subscription status, seat usage, and renewal reminders.
          </p>
          <div className="mt-5 rounded-2xl border-2 border-[#102A54] bg-[#FFFEF8] p-4">
            <p className="text-xs font-black uppercase tracking-wide text-[#102A54]/55">
              Seats used
            </p>
            <p className="mt-1 text-2xl font-black text-[#102A54]">
              {dashboard.summary.studentCount} / 100
            </p>
          </div>
        </Card>
      </div>
    </DashboardShell>
  );
}
