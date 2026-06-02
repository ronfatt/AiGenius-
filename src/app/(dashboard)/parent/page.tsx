import { PetCard } from "@/components/cards/PetCard";
import { ProgressChart } from "@/components/charts/ProgressChart";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Card, ListRow, StatCard } from "@/components/ui";
import { getCurrentProfile } from "@/lib/auth";
import { getParentDashboard, getParentDashboardFromSupabase } from "@/lib/dashboard-data";
import { addChildByCodeAction } from "./actions";

type DashboardPageProps = {
  searchParams?: Promise<{ status?: string; error?: string }>;
};

export default async function ParentDashboard({ searchParams }: DashboardPageProps) {
  const message = await searchParams;
  const currentProfile = await getCurrentProfile().catch(() => null);
  const liveDashboard =
    currentProfile?.role === "parent"
      ? await getParentDashboardFromSupabase(currentProfile.id)
      : null;
  const dashboard = liveDashboard ?? getParentDashboard();
  const parentCode = currentProfile?.profile_code ?? dashboard.parent?.profileCode ?? "TANPA";

  return (
    <DashboardShell title="Parent Dashboard" variant="parent">
      {message?.status || message?.error ? (
        <div
          className={`mb-4 rounded-2xl border-2 border-[#102A54] px-4 py-3 text-sm font-black ${
            message.error ? "bg-[#FFB199]" : "bg-[#7BE0C3]"
          }`}
        >
          {message.error ?? message.status}
        </div>
      ) : null}

      <section className="mb-5 rounded-[2rem] border-4 border-[#102A54] bg-[#FFFEF8] p-5 shadow-[8px_8px_0_rgba(16,42,84,0.12)]">
        <p className="inline-flex rounded-full border-2 border-[#102A54] bg-[#FFB199] px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-[#102A54]">
          Parent learning report · {liveDashboard ? "Live Supabase" : "Mock fallback"}
        </p>
        <div className="mt-3 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <h2 className="text-3xl font-black text-[#102A54]">
              Progress for {dashboard.childName}
            </h2>
            <p className="mt-2 text-sm font-bold text-[#102A54]/65">
              A clear view of Malaysian English target, learning level,
              homework, attendance, and pet motivation.
            </p>
          </div>
          <span className="rounded-full border-2 border-[#102A54] bg-[#EEF2F5] px-4 py-2 text-sm font-black text-[#102A54]">
            {dashboard.report.month} preview
          </span>
          <span className="rounded-full border-2 border-[#102A54] bg-[#FFD95A] px-4 py-2 text-sm font-black text-[#102A54]">
            Parent Code: {parentCode}
          </span>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard value={dashboard.child.schoolGrade} label="School grade" />
        <StatCard value={dashboard.cefrTarget} label="CEFR target" />
        <StatCard
          value={`${dashboard.child.homeworkCompletionRate}%`}
          label="Homework"
        />
        <StatCard value={`${dashboard.child.attendanceRate}%`} label="Attendance" />
      </div>

      <Card className="mt-4 bg-gradient-to-br from-[#FFF7E2] to-[#4FB8FF]/25">
        <div className="grid gap-4 lg:grid-cols-[1fr_0.9fr] lg:items-end">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#FF6B57]">
              Family link
            </p>
            <h2 className="mt-2 text-2xl font-black">Add child by student code</h2>
            <p className="mt-2 text-sm font-bold leading-6 text-[#102A54]/65">
              Ask your child for the referral code shown on their student
              dashboard. Once linked, parent reports and learning progress can
              stay connected to your dashboard.
            </p>
          </div>
          <form action={addChildByCodeAction} className="flex flex-col gap-3 sm:flex-row">
            <input
              name="studentCode"
              placeholder="ALYSA"
              maxLength={5}
              className="min-h-14 flex-1 rounded-2xl border-2 border-[#102A54] bg-[#FFFEF8] px-4 text-sm font-black uppercase text-[#102A54] outline-none"
            />
            <button
              type="submit"
              className="min-h-14 rounded-2xl border-2 border-[#102A54] bg-[#FFD95A] px-5 text-sm font-black shadow-[4px_4px_0_#102A54] transition hover:-translate-y-0.5"
            >
              Link child
            </button>
          </form>
        </div>
      </Card>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1fr_0.9fr]">
        <Card>
          <h2 className="text-2xl font-black">Learning level vs school grade</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <ListRow
              title="Current school grade"
              meta={dashboard.child.schoolGrade}
              badge="School"
            />
            <ListRow
              title="CEFR English target"
              meta={`${dashboard.child.schoolGrade} · ${dashboard.cefrTarget}`}
              badge="KSSR"
            />
          </div>
          <div className="mt-5 grid gap-5">
            {dashboard.skills.map((skill) => (
              <ProgressChart
                key={skill.id}
                label={`${skill.subject}: ${skill.skillName}`}
                value={skill.masteryPercentage}
              />
            ))}
          </div>
        </Card>

        <PetCard pet={dashboard.pet} />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <h2 className="text-2xl font-black">Latest teacher comment</h2>
          <p className="mt-4 rounded-2xl border-2 border-[#102A54]/15 bg-[#FFF7E2] p-4 text-sm font-medium leading-6 text-[#102A54]/70">
            {dashboard.report.teacherComment}
          </p>
          <div className="mt-4 grid gap-3">
            {dashboard.recentRewards.map((reward) => (
              <ListRow
                key={reward.id}
                title={reward.reason}
                meta={`+${reward.xpAmount} XP · +${reward.coinAmount} coins`}
                badge="Reward"
              />
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="text-2xl font-black">Monthly report preview</h2>
          <p className="mt-3 text-sm font-bold leading-6 text-[#102A54]/65">
            {dashboard.report.summary}
          </p>
          <div className="mt-4 grid gap-3">
            <ListRow
              title="Strengths"
              meta={dashboard.report.strengths.join(", ")}
              badge="Good"
            />
            <ListRow
              title="Weaknesses"
              meta={dashboard.report.weaknesses.join(", ")}
              badge="Focus"
            />
            <ListRow
              title="Recommendations"
              meta={dashboard.report.recommendations.join(", ")}
              badge="Next"
            />
          </div>
        </Card>
      </div>
    </DashboardShell>
  );
}
