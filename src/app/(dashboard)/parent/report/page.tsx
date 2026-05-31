import { PetCard } from "@/components/cards/PetCard";
import { ProgressChart } from "@/components/charts/ProgressChart";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Card, ListRow, StatCard } from "@/components/ui";
import { getCefrTargetForGrade } from "@/lib/cefr-level";
import { getParentDashboard } from "@/lib/dashboard-data";
import { detectLearningGap } from "@/lib/learning-level";

export default function ParentReportPage() {
  const dashboard = getParentDashboard();
  const gap = detectLearningGap(dashboard.child.schoolGrade, dashboard.child.actualLearningLevel);

  return (
    <DashboardShell title="Parent English Report">
      <section className="mb-5 rounded-[2rem] border-4 border-[#102A54] bg-[#FFFEF8] p-5 shadow-[8px_8px_0_rgba(16,42,84,0.12)]">
        <p className="inline-flex rounded-full border-2 border-[#102A54] bg-[#FFB199] px-3 py-1 text-xs font-black uppercase tracking-[0.16em]">
          Monthly report
        </p>
        <h1 className="mt-3 text-4xl font-black text-[#102A54]">English Progress Summary</h1>
        <p className="mt-2 text-sm font-bold leading-6 text-[#102A54]/65">{dashboard.report.summary}</p>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard value={dashboard.child.schoolGrade} label="School grade" />
        <StatCard value={dashboard.child.actualLearningLevel} label="Actual level" />
        <StatCard value={getCefrTargetForGrade(dashboard.child.schoolGrade)} label="CEFR target" />
        <StatCard value={`${dashboard.child.homeworkCompletionRate}%`} label="Homework" />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1fr_0.9fr]">
        <Card>
          <h2 className="text-2xl font-black">CEFR progress</h2>
          <p className="mt-3 rounded-2xl border-2 border-[#102A54]/20 bg-[#FFF7E2] p-4 text-sm font-bold text-[#102A54]/70">
            {gap.recommendation}
          </p>
          <div className="mt-5 grid gap-5">
            {dashboard.skills.map((skill) => (
              <ProgressChart key={skill.id} label={`${skill.skillName}`} value={skill.masteryPercentage} />
            ))}
          </div>
        </Card>
        <PetCard pet={dashboard.pet} />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <Card>
          <h2 className="text-2xl font-black">Teacher comment</h2>
          <p className="mt-3 text-sm font-bold leading-6 text-[#102A54]/70">{dashboard.report.teacherComment}</p>
        </Card>
        <Card>
          <h2 className="text-2xl font-black">Recommendations</h2>
          <div className="mt-4 grid gap-3">
            {dashboard.report.recommendations.map((item) => (
              <ListRow key={item} title={item} meta="Home support" badge="Next" />
            ))}
          </div>
        </Card>
        <Card>
          <h2 className="text-2xl font-black">Pet motivation</h2>
          <p className="mt-3 text-sm font-bold leading-6 text-[#102A54]/70">
            Pet growth reflects consistent English quest completion, attendance, and teacher rewards.
          </p>
        </Card>
      </div>
    </DashboardShell>
  );
}
