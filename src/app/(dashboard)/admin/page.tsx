import { ProgressChart } from "@/components/charts/ProgressChart";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Card, ListRow, StatCard } from "@/components/ui";
import {
  getAdminDashboard,
  getAdminDashboardFromSupabase,
  getClassTeacherName,
  getStudentName,
} from "@/lib/dashboard-data";
import { createSchoolTagAction } from "./actions";

type DashboardPageProps = {
  searchParams?: Promise<{ status?: string; error?: string }>;
};

function CockpitBadge({
  label,
  value,
  tone = "blue",
}: {
  label: string;
  value: string;
  tone?: "blue" | "gold" | "green" | "coral";
}) {
  const tones = {
    blue: "bg-[#4FB8FF]",
    gold: "bg-[#FFD95A]",
    green: "bg-[#7BE0C3]",
    coral: "bg-[#FFB199]",
  };

  return (
    <div
      className={`rounded-[1.4rem] border-2 border-[#102A54] p-4 text-[#102A54] shadow-[4px_4px_0_#102A54] ${tones[tone]}`}
    >
      <p className="text-xs font-black uppercase tracking-[0.12em] opacity-70">{label}</p>
      <p className="mt-1 text-3xl font-black">{value}</p>
    </div>
  );
}

export default async function AdminDashboard({ searchParams }: DashboardPageProps) {
  const liveDashboard = await getAdminDashboardFromSupabase();
  const dashboard = liveDashboard ?? getAdminDashboard();
  const message = await searchParams;
  const urgentActions = [
    {
      title: "Review backlog",
      meta: `${dashboard.summary.pendingReviewCount} student submissions need teacher review`,
      badge: dashboard.summary.pendingReviewCount > 0 ? "Action" : "Clear",
    },
    {
      title: "At-risk learners",
      meta: `${dashboard.summary.atRiskStudentCount} students need attendance or skill support`,
      badge: dashboard.summary.atRiskStudentCount > 0 ? "Watch" : "OK",
    },
    {
      title: "Parent reports",
      meta: `${dashboard.reportControl.generatedCount} generated · ${dashboard.reportControl.pendingTeacherCommentCount} pending`,
      badge: "Reports",
    },
  ];
  const healthItems = [
    ["Auth", "Supabase auth connected", "Live"],
    ["Database", "Migrations ready for English curriculum", "Ready"],
    ["Storage", "Pet, boss, emotion, blind box assets prepared", "Assets"],
    ["AI", "Teacher English planner uses OpenAI with mock fallback", "AI"],
  ];

  return (
    <DashboardShell title="Admin Operations" variant="admin">
      {message?.status || message?.error ? (
        <div
          className={`mb-4 rounded-2xl border-2 border-[#102A54] px-4 py-3 text-sm font-black ${
            message.error ? "bg-[#FFB199]" : "bg-[#7BE0C3]"
          }`}
        >
          {message.error ?? message.status}
        </div>
      ) : null}

      <section className="mb-5 overflow-hidden rounded-[2rem] border-4 border-[#102A54] bg-gradient-to-br from-[#071E63] via-[#12389B] to-[#4D20AA] p-5 text-white shadow-[8px_8px_0_rgba(16,42,84,0.2)]">
        <div className="flex flex-col justify-between gap-5 xl:flex-row xl:items-end">
          <div>
            <p className="inline-flex rounded-full border border-white/25 bg-white/12 px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-[#FFCF17]">
              Centre operations cockpit · {liveDashboard ? "Live Supabase" : "Mock fallback"}
            </p>
            <h1 className="mt-3 text-4xl font-black sm:text-5xl">
              {dashboard.centreName}
            </h1>
            <p className="mt-3 max-w-3xl text-sm font-bold leading-6 text-white/68">
              Track learning activity, teacher workflow, school participation,
              parent reporting, and subscription readiness from one admin view.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 xl:min-w-[520px]">
            <CockpitBadge
              label="Pending Reviews"
              value={dashboard.summary.pendingReviewCount.toString()}
              tone="gold"
            />
            <CockpitBadge
              label="At Risk"
              value={dashboard.summary.atRiskStudentCount.toString()}
              tone="coral"
            />
            <CockpitBadge
              label="Reports"
              value={dashboard.summary.reportGeneratedCount.toString()}
              tone="green"
            />
          </div>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard value={dashboard.summary.studentCount.toString()} label="Total students" />
        <StatCard value={dashboard.summary.classCount.toString()} label="Active classes" />
        <StatCard value={dashboard.summary.teacherCount.toString()} label="Teachers" />
        <StatCard value={dashboard.summary.totalRewardsIssued.toString()} label="Coins issued" />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <Card className="bg-gradient-to-br from-[#FFF7E2] to-[#FFFEF8]">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#FF6B57]">
            Action queue
          </p>
          <h2 className="mt-2 text-2xl font-black">What needs attention today</h2>
          <div className="mt-4 grid gap-3">
            {urgentActions.map((item) => (
              <ListRow key={item.title} title={item.title} meta={item.meta} badge={item.badge} />
            ))}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#FF6B57]">
                Centre health
              </p>
              <h2 className="mt-2 text-2xl font-black">Learning activity</h2>
            </div>
            <span className="rounded-full border-2 border-[#102A54] bg-[#FFD95A] px-3 py-1 text-xs font-black text-[#102A54]">
              {dashboard.summary.monthlyLearningActivity} events
            </span>
          </div>
          <div className="mt-5 grid gap-5">
            <ProgressChart label="Homework completion" value={dashboard.summary.averageHomework} />
            <ProgressChart label="Attendance" value={dashboard.summary.averageAttendance} />
            <ProgressChart label="Reward engagement" value={dashboard.summary.rewardEngagement} />
          </div>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
        <Card>
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#FF6B57]">
                School tags analytics
              </p>
              <h2 className="mt-2 text-2xl font-black">Participation by school</h2>
            </div>
            <span className="rounded-full border-2 border-[#102A54] bg-[#7BE0C3] px-3 py-1 text-xs font-black text-[#102A54]">
              {dashboard.summary.schoolTagCount} schools
            </span>
          </div>
          <div className="mt-4 grid gap-3">
            {dashboard.schoolTags.map((tag) => (
              <div
                key={tag.id}
                className="rounded-[1.4rem] border-2 border-[#102A54]/15 bg-[#FFF7E2] p-4"
              >
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                  <div>
                    <p className="font-black text-[#102A54]">{tag.name}</p>
                    <p className="mt-1 text-sm font-bold text-[#102A54]/60">
                      {tag.area} · {tag.teacherCount} teachers · {tag.studentCount} students · {tag.activeClassCount} classes
                    </p>
                  </div>
                  <span className="rounded-full border-2 border-[#102A54] bg-[#FFD95A] px-3 py-1 text-xs font-black text-[#102A54]">
                    {tag.growthSignal}
                  </span>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <ProgressChart label="Homework" value={tag.averageHomework} />
                  <ProgressChart label="Attendance" value={tag.averageAttendance} />
                  <ProgressChart label="Risk control" value={Math.max(0, 100 - tag.atRiskCount * 20)} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-[#FFF7E2] to-[#4FB8FF]/25">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#FF6B57]">
            Admin setup
          </p>
          <h2 className="mt-2 text-2xl font-black">Create school tag</h2>
          <p className="mt-2 text-sm font-bold leading-6 text-[#102A54]/65">
            Group students and teachers by school, area, or feeder community.
          </p>
          <form action={createSchoolTagAction} className="mt-4 grid gap-3">
            <input
              name="name"
              placeholder="SJKC Yuk Chin"
              className="min-h-12 rounded-2xl border-2 border-[#102A54] bg-[#FFFEF8] px-4 text-sm font-bold text-[#102A54] outline-none"
            />
            <input
              name="code"
              placeholder="YUKCH"
              className="min-h-12 rounded-2xl border-2 border-[#102A54] bg-[#FFFEF8] px-4 text-sm font-bold uppercase text-[#102A54] outline-none"
            />
            <input
              name="area"
              placeholder="Tawau Central"
              className="min-h-12 rounded-2xl border-2 border-[#102A54] bg-[#FFFEF8] px-4 text-sm font-bold text-[#102A54] outline-none"
            />
            <button
              type="submit"
              className="min-h-14 rounded-2xl border-2 border-[#102A54] bg-[#FFD95A] px-5 text-sm font-black shadow-[4px_4px_0_#102A54] transition hover:-translate-y-0.5"
            >
              Save school tag
            </button>
          </form>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <Card>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#FF6B57]">
            Teacher performance
          </p>
          <h2 className="mt-2 text-2xl font-black">Workflow overview</h2>
          <div className="mt-4 grid gap-3">
            {dashboard.teacherPerformance.map((item) => (
              <ListRow
                key={item.teacher.id}
                title={item.teacher.name}
                meta={`${item.classCount} classes · ${item.studentCount} students · ${item.taskCount} tasks · ${item.reviewedCount} reviewed`}
                badge={`${item.pendingReviewCount} pending`}
              />
            ))}
          </div>
        </Card>

        <Card>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#FF6B57]">
            English curriculum control
          </p>
          <h2 className="mt-2 text-2xl font-black">Weak skills trend</h2>
          <div className="mt-4 grid gap-3">
            {dashboard.weakSkillOverview.map((skill) => (
              <ListRow
                key={skill.tag}
                title={skill.tag}
                meta="Repeated weakness across active students"
                badge={`${skill.count} cases`}
              />
            ))}
          </div>
        </Card>

        <Card>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#FF6B57]">
            At-risk students
          </p>
          <h2 className="mt-2 text-2xl font-black">Intervention watchlist</h2>
          <div className="mt-4 grid gap-3">
            {dashboard.studentsAtRisk.slice(0, 5).map((student) => (
              <ListRow
                key={student.id}
                title={dashboard.studentNameByUserId?.[student.userId] ?? getStudentName(student)}
                meta={`${student.schoolGrade} · ${student.homeworkCompletionRate}% homework · ${student.attendanceRate}% attendance`}
                badge="Support"
              />
            ))}
          </div>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1fr_1fr_0.9fr]">
        <Card>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#FF6B57]">
            Report control
          </p>
          <h2 className="mt-2 text-2xl font-black">Parent confidence layer</h2>
          <div className="mt-4 grid gap-3">
            <ListRow title="Generated reports" meta="Ready for parent review" badge={`${dashboard.reportControl.generatedCount}`} />
            <ListRow title="Viewed by parents" meta="Mock viewed signal for MVP" badge={`${dashboard.reportControl.viewedByParentCount}`} />
            <ListRow title="Need teacher comment" meta="Reports waiting for stronger teacher narrative" badge={`${dashboard.reportControl.pendingTeacherCommentCount}`} />
          </div>
        </Card>

        <Card>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#FF6B57]">
            System health
          </p>
          <h2 className="mt-2 text-2xl font-black">MVP readiness</h2>
          <div className="mt-4 grid gap-3">
            {healthItems.map(([title, meta, badge]) => (
              <ListRow key={title} title={title} meta={meta} badge={badge} />
            ))}
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-[#FFF7E2] to-[#7BE0C3]/35">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#FF6B57]">
            Subscription
          </p>
          <h2 className="mt-2 text-3xl font-black text-[#102A54]">
            {dashboard.subscription.plan}
          </h2>
          <div className="mt-5 grid gap-4">
            <ProgressChart
              label={`Students ${dashboard.summary.studentCount}/${dashboard.subscription.studentQuota}`}
              value={(dashboard.summary.studentCount / dashboard.subscription.studentQuota) * 100}
            />
            <ProgressChart
              label={`AI generations ${dashboard.subscription.aiGenerationUsed}/${dashboard.subscription.aiGenerationQuota}`}
              value={(dashboard.subscription.aiGenerationUsed / dashboard.subscription.aiGenerationQuota) * 100}
            />
            <ProgressChart label="Storage usage" value={dashboard.subscription.storageUsedPercent} />
          </div>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <Card>
          <h2 className="text-2xl font-black">Active classes</h2>
          <div className="mt-4 grid gap-3">
            {dashboard.classrooms.map((classroom) => (
              <ListRow
                key={classroom.id}
                title={classroom.name}
                meta={`${dashboard.teacherNameById?.[classroom.teacherId] ?? getClassTeacherName(classroom)} · ${classroom.studentIds.length} students`}
                badge={classroom.grade}
              />
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="text-2xl font-black">MVP modules</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <ListRow title="Tasks" meta={`${dashboard.tasks.length} learning tasks`} badge="Live" />
            <ListRow title="Pets" meta={`${dashboard.pets.length} student pets`} badge="Game" />
            <ListRow title="Cards" meta={`${dashboard.cards.length} pet cards`} badge="Draw" />
            <ListRow title="Battles" meta={`${dashboard.battles.length} quiz battle`} badge="Quiz" />
          </div>
        </Card>
      </div>
    </DashboardShell>
  );
}
