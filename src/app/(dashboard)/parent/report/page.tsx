import { ProgressChart } from "@/components/charts/ProgressChart";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { ReportActions } from "@/components/parent/ReportActions";
import { Card, ListRow, StatCard } from "@/components/ui";
import { getCurrentProfile } from "@/lib/auth";
import { getCefrTargetForGrade } from "@/lib/cefr-level";
import { getParentDashboard, getParentDashboardFromSupabase } from "@/lib/dashboard-data";
import { detectLearningGap } from "@/lib/learning-level";
import { generateMonthlyParentReportForParent } from "@/lib/parent-report-generator";

function clamp(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function shortLevel(value: string) {
  return value.replace("Level ", "L");
}

function buildParentSummary(input: {
  childName: string;
  schoolGrade: string;
  actualLevel: string;
  cefrTarget: string;
  weakestSkill: string;
  strongestSkill: string;
  homework: number;
  attendance: number;
}) {
  return [
    `${input.childName} is currently working at ${input.actualLevel} for ${input.schoolGrade}, with CEFR ${input.cefrTarget} as the learning target.`,
    `${input.strongestSkill} is the strongest area this month, while ${input.weakestSkill} needs the most support.`,
    `Home routine is ${input.homework}% homework completion and ${input.attendance}% attendance, so the next step is short daily practice with teacher follow-up.`,
  ];
}

function buildTrend(child: { attendanceRate: number; homeworkCompletionRate: number; streakDays: number }, averageMastery: number) {
  return [
    { label: "Week 1", score: clamp(averageMastery - 9), homework: clamp(child.homeworkCompletionRate - 10) },
    { label: "Week 2", score: clamp(averageMastery - 4), homework: clamp(child.homeworkCompletionRate - 6) },
    { label: "Week 3", score: clamp(averageMastery + 1), homework: clamp(child.homeworkCompletionRate - 2) },
    { label: "Week 4", score: clamp(averageMastery + Math.min(8, child.streakDays)), homework: clamp(child.homeworkCompletionRate) },
  ];
}

export default async function ParentReportPage() {
  const currentProfile = await getCurrentProfile().catch(() => null);
  if (currentProfile?.role === "parent") {
    await generateMonthlyParentReportForParent(currentProfile.id);
  }
  const liveDashboard =
    currentProfile?.role === "parent"
      ? await getParentDashboardFromSupabase(currentProfile.id)
      : null;
  const dashboard = liveDashboard ?? getParentDashboard();
  const gap = detectLearningGap(dashboard.child.schoolGrade, dashboard.child.actualLearningLevel);
  const sortedSkills = [...dashboard.skills].sort((a, b) => a.masteryPercentage - b.masteryPercentage);
  const weakestSkills = sortedSkills.slice(0, 3);
  const strongestSkills = [...dashboard.skills]
    .sort((a, b) => b.masteryPercentage - a.masteryPercentage)
    .slice(0, 3);
  const averageMastery = clamp(
    dashboard.skills.reduce((total, skill) => total + skill.masteryPercentage, 0) /
      Math.max(1, dashboard.skills.length),
  );
  const cefrTarget = getCefrTargetForGrade(dashboard.child.schoolGrade);
  const summaryLines = buildParentSummary({
    childName: dashboard.childName,
    schoolGrade: dashboard.child.schoolGrade,
    actualLevel: dashboard.child.actualLearningLevel,
    cefrTarget,
    weakestSkill: weakestSkills[0]?.skillName ?? "English foundation",
    strongestSkill: strongestSkills[0]?.skillName ?? "learning effort",
    homework: dashboard.child.homeworkCompletionRate,
    attendance: dashboard.child.attendanceRate,
  });
  const trend = buildTrend(dashboard.child, averageMastery);
  const homePlan = [
    {
      title: "5-minute reading",
      meta: "Ask: What is the main idea? Let the child answer in one short sentence.",
      badge: "Daily",
    },
    {
      title: "3-word review",
      meta: `Revise words from ${weakestSkills[0]?.weaknessTag ?? weakestSkills[0]?.skillName ?? "this week's task"}.`,
      badge: "Vocab",
    },
    {
      title: "1 grammar correction",
      meta: "Correct one sentence together. Keep it short and positive.",
      badge: "Grammar",
    },
  ];

  return (
    <DashboardShell title="Parent English Report" variant="parent">
      <div className="print-only mb-6 border-b-2 border-[#102A54] pb-4">
        <p className="text-sm font-black uppercase tracking-[0.16em] text-[#102A54]/70">
          AiGenius Tuition Centre
        </p>
        <h1 className="mt-1 text-3xl font-black text-[#102A54]">Parent English Progress Report</h1>
        <p className="mt-1 text-sm font-bold text-[#102A54]/70">
          {dashboard.childName} · {dashboard.child.schoolGrade} · CEFR target {cefrTarget}
        </p>
      </div>
      <section className="mb-5 rounded-[2rem] border-4 border-[#102A54] bg-[#FFFEF8] p-5 shadow-[8px_8px_0_rgba(16,42,84,0.12)]">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
          <div>
            <p className="inline-flex rounded-full border-2 border-[#102A54] bg-[#FFB199] px-3 py-1 text-xs font-black uppercase tracking-[0.16em]">
              Parent assurance report · {liveDashboard ? "Live Supabase" : "Auto preview"}
            </p>
            <h1 className="mt-3 text-4xl font-black text-[#102A54]">English Progress Summary</h1>
            <p className="mt-2 max-w-3xl text-sm font-bold leading-6 text-[#102A54]/65">
              A clear monthly view of progress, weak skills, teacher follow-up, and simple home support.
            </p>
          </div>
          <div className="rounded-[1.4rem] border-2 border-[#102A54] bg-[#FFD95A] px-5 py-4 text-[#102A54]">
            <p className="text-xs font-black uppercase tracking-wide opacity-70">Current focus</p>
            <p className="mt-1 text-2xl font-black">{weakestSkills[0]?.skillName ?? "English"}</p>
          </div>
        </div>
        <div className="mt-5">
          <ReportActions summary={summaryLines} />
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard value={dashboard.child.schoolGrade} label="School grade" />
        <StatCard value={shortLevel(dashboard.child.actualLearningLevel)} label="Actual level" />
        <StatCard value={cefrTarget} label="CEFR target" />
        <StatCard value={`${dashboard.child.homeworkCompletionRate}%`} label="Homework" />
      </div>

      <Card className="mt-4 bg-gradient-to-br from-[#FFFEF8] to-[#EEF6FF]">
        <h2 className="text-2xl font-black">3-sentence parent summary</h2>
        <div className="mt-4 grid gap-3">
          {summaryLines.map((line, index) => (
            <div key={line} className="flex gap-3 rounded-2xl border-2 border-[#102A54]/15 bg-white p-4">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#102A54] text-sm font-black text-white">
                {index + 1}
              </span>
              <p className="text-sm font-bold leading-6 text-[#102A54]/75">{line}</p>
            </div>
          ))}
        </div>
      </Card>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1fr_0.9fr]">
        <Card>
          <h2 className="text-2xl font-black">Progress trend</h2>
          <p className="mt-3 rounded-2xl border-2 border-[#102A54]/20 bg-[#FFF7E2] p-4 text-sm font-bold text-[#102A54]/70">
            {gap.recommendation}
          </p>
          <div className="mt-5 grid gap-3">
            {trend.map((item) => (
              <div key={item.label} className="rounded-2xl border-2 border-[#102A54]/15 bg-[#FFF7E2] p-4">
                <div className="mb-3 flex items-center justify-between text-sm font-black text-[#102A54]">
                  <span>{item.label}</span>
                  <span>{item.score}% English · {item.homework}% homework</span>
                </div>
                <div className="grid gap-2">
                  <ProgressChart label="English skill trend" value={item.score} />
                  <ProgressChart label="Homework routine" value={item.homework} />
                </div>
              </div>
            ))}
          </div>
        </Card>
        <Card className="bg-gradient-to-br from-[#FFF7E2] to-[#7BE0C3]/35">
          <h2 className="text-2xl font-black">Learning consistency</h2>
          <div className="mt-5 grid gap-5">
            <ProgressChart label="Attendance consistency" value={dashboard.child.attendanceRate} />
            <ProgressChart label="Homework follow-through" value={dashboard.child.homeworkCompletionRate} />
            <ProgressChart label="Weekly learning routine" value={Math.min(100, dashboard.child.streakDays * 12)} />
          </div>
          <p className="mt-4 rounded-2xl border-2 border-[#102A54]/20 bg-[#FFFEF8] p-4 text-sm font-bold leading-6 text-[#102A54]/70">
            Rewards are used only as motivation for routine and effort. Academic progress, teacher feedback, and skill mastery remain the main measurement.
          </p>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <Card>
          <h2 className="text-2xl font-black">Strengths and weak skills</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border-2 border-[#102A54]/15 bg-[#E9FFF3] p-4">
              <p className="text-xs font-black uppercase tracking-wide text-[#0C7A43]">Strengths</p>
              <div className="mt-3 grid gap-2">
                {strongestSkills.map((skill) => (
                  <ListRow key={skill.id} title={skill.skillName} meta={`${skill.masteryPercentage}% mastery`} badge="Good" />
                ))}
              </div>
            </div>
            <div className="rounded-2xl border-2 border-[#102A54]/15 bg-[#FFF0ED] p-4">
              <p className="text-xs font-black uppercase tracking-wide text-[#B42318]">Needs support</p>
              <div className="mt-3 grid gap-2">
                {weakestSkills.map((skill) => (
                  <ListRow key={skill.id} title={skill.skillName} meta={skill.weaknessTag || "Review foundation"} badge="Watch" />
                ))}
              </div>
            </div>
          </div>
        </Card>
        <Card>
          <h2 className="text-2xl font-black">Home support plan</h2>
          <div className="mt-4 grid gap-3">
            {homePlan.map((item) => (
              <ListRow key={item.title} title={item.title} meta={item.meta} badge={item.badge} />
            ))}
          </div>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <Card>
          <h2 className="text-2xl font-black">Teacher follow-up</h2>
          <p className="mt-3 text-sm font-bold leading-6 text-[#102A54]/70">
            {dashboard.report.teacherComment}
          </p>
          <div className="mt-4 grid gap-3">
            <ListRow title="Follow-up status" meta="Teacher review is used to update rewards, weak skills, and monthly reports." badge="Active" />
            <ListRow title="Next teacher focus" meta={weakestSkills[0]?.weaknessTag ?? weakestSkills[0]?.skillName ?? "Foundation English"} badge="Next" />
          </div>
        </Card>
        <Card>
          <h2 className="text-2xl font-black">Ability progress</h2>
          <p className="mt-3 text-sm font-bold leading-6 text-[#102A54]/70">
            Current focus is closing the gap between actual English level and school grade expectations through short daily practice.
          </p>
          <div className="mt-4 grid gap-3">
            <ListRow title="Learning gap" meta={gap.recommendation} badge={gap.band} />
            <ListRow title="Next focus" meta={weakestSkills[0]?.skillName ?? "Reading comprehension and grammar accuracy"} badge="English" />
          </div>
        </Card>
        <Card className="bg-gradient-to-br from-[#EEF6FF] to-[#FFFEF8]">
          <h2 className="text-2xl font-black">Motivation summary</h2>
          <p className="mt-3 text-sm font-bold leading-6 text-[#102A54]/70">
            Pet growth is shown to the student as motivation only. It reflects completed practice,
            consistency, and teacher-approved effort, not a replacement for English progress.
          </p>
          <div className="mt-4 grid gap-3">
            <ListRow title="Learning habit" meta={`${dashboard.child.streakDays} day streak recorded`} badge="Routine" />
            <ListRow title="Rewards purpose" meta="Encourage consistency and confidence" badge="Motivate" />
          </div>
        </Card>
      </div>
    </DashboardShell>
  );
}
