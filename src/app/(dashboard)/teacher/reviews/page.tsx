import Link from "next/link";
import { TeacherReviewWorkbench } from "@/components/teacher/TeacherReviewWorkbench";
import { Card, StatCard } from "@/components/ui";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { getCurrentProfile } from "@/lib/auth";
import {
  getTeacherReviewQueue,
  getTeacherReviewQueueFromSupabase,
} from "@/lib/teacher-review-data";

export default async function TeacherReviewsPage() {
  const profile = await getCurrentProfile().catch(() => null);
  const supabaseItems =
    profile?.role === "teacher" ? await getTeacherReviewQueueFromSupabase(profile.id) : [];
  const reviewItems = supabaseItems.length ? supabaseItems : getTeacherReviewQueue();
  const pendingItems = reviewItems.filter((item) => item.submission.status === "submitted");
  const reviewedItems = reviewItems.filter((item) => item.submission.status === "reviewed");
  const averageScore = Math.round(
    reviewItems.reduce((total, item) => total + item.submission.score, 0) /
      Math.max(1, reviewItems.length),
  );
  const weakSkillCount = new Set(reviewItems.flatMap((item) => item.weakSkillTags)).size;

  return (
    <DashboardShell title="Teacher Review Queue" variant="teacher">
      <section className="mb-5 rounded-[2rem] border-4 border-[#102A54] bg-[#FFFEF8] p-5 shadow-[8px_8px_0_rgba(16,42,84,0.12)]">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div>
            <p className="inline-flex rounded-full border-2 border-[#102A54] bg-[#7BE0C3] px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-[#102A54]">
              Teacher review flow
            </p>
            <h1 className="mt-3 text-3xl font-black text-[#102A54] sm:text-4xl">
              Review submissions, reward effort, and mark weak skills fast.
            </h1>
            <p className="mt-2 max-w-3xl text-sm font-bold leading-6 text-[#102A54]/65">
              Use this workbench after students complete English quests. The teacher can inspect
              answers, write a clear comment, approve rewards, and flag skills for the next lesson.
            </p>
          </div>
          <Link
            href="/teacher/tasks/create"
            className="grid min-h-14 place-items-center rounded-2xl border-2 border-[#102A54] bg-[#FFD95A] px-5 text-sm font-black text-[#102A54] shadow-[4px_4px_0_#102A54] transition hover:-translate-y-0.5 hover:shadow-[6px_6px_0_#102A54]"
          >
            Create next task
          </Link>
        </div>
      </section>

      {!supabaseItems.length ? (
        <div className="mb-4 rounded-2xl border-2 border-[#102A54] bg-[#FFD95A] px-4 py-3 text-sm font-black text-[#102A54]">
          Showing mock submissions. Once Supabase has real task submissions for this teacher,
          approving reviews will write to the database.
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard value={pendingItems.length.toString()} label="Pending reviews" />
        <StatCard value={reviewedItems.length.toString()} label="Reviewed" />
        <StatCard value={`${averageScore}%`} label="Average score" />
        <StatCard value={weakSkillCount.toString()} label="Weak skills found" />
      </div>

      <div className="my-4 grid gap-4 lg:grid-cols-3">
        <Card className="bg-[#FFF7E2]">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#FF6B57]">
            Review logic
          </p>
          <h2 className="mt-2 text-2xl font-black">Fast teacher decision</h2>
          <p className="mt-2 text-sm font-bold leading-6 text-[#102A54]/65">
            Check wrong answers first, reuse the suggested comment when suitable, then adjust weak
            tags before approving the review.
          </p>
        </Card>
        <Card className="bg-[#EEF6FF]">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#4FB8FF]">
            Reward logic
          </p>
          <h2 className="mt-2 text-2xl font-black">Reward progress</h2>
          <p className="mt-2 text-sm font-bold leading-6 text-[#102A54]/65">
            XP and Star Coins are suggested from the reward engine, with stronger emphasis on
            improvement and challenge completion.
          </p>
        </Card>
        <Card className="bg-[#E9FFF3]">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#0C7A43]">
            Learning loop
          </p>
          <h2 className="mt-2 text-2xl font-black">Feed the next lesson</h2>
          <p className="mt-2 text-sm font-bold leading-6 text-[#102A54]/65">
            Marked weak skills become the teacher signal for foundation tasks, intervention, and
            parent reporting.
          </p>
        </Card>
      </div>

      <TeacherReviewWorkbench items={reviewItems} />
    </DashboardShell>
  );
}
