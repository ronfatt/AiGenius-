import Link from "next/link";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { getCurrentProfile } from "@/lib/auth";
import { getStudentDashboard } from "@/lib/dashboard-data";
import { getStudentTasksFromSupabase } from "@/lib/student-task-data";

export default async function StudentTasksPage() {
  const dashboard = getStudentDashboard();
  const profile = await getCurrentProfile().catch(() => null);
  const supabaseTasks =
    profile?.role === "student" ? await getStudentTasksFromSupabase(profile.id) : [];
  const tasks = supabaseTasks.length ? supabaseTasks : dashboard.tasks;
  const requiredTasks = tasks.slice(0, 3);
  const bonusTasks = tasks.slice(3);

  return (
    <DashboardShell title="Student English Quests" immersive>
      <div className="min-h-screen bg-[#071E63] bg-[radial-gradient(circle_at_18%_8%,rgba(79,184,255,0.55),transparent_28%),radial-gradient(circle_at_82%_16%,rgba(139,56,255,0.45),transparent_24%),linear-gradient(180deg,#061956_0%,#0B2F86_48%,#142C7D_100%)] px-4 pb-28 pt-4 text-white sm:px-6 lg:p-6 lg:pb-8">
        <div className="mx-auto grid max-w-6xl gap-5 xl:grid-cols-[430px_1fr]">
          <section className="relative mx-auto w-full max-w-[430px] overflow-hidden rounded-[2.2rem] border border-white/20 bg-[#08256F]/85 p-4 shadow-[0_24px_80px_rgba(0,0,0,0.25)] backdrop-blur">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#FFCF17]">
                  English mission
                </p>
                <h1 className="mt-1 text-3xl font-black">Quest Board</h1>
              </div>
              <Link href="/student" className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-xs font-black">
                Home
              </Link>
            </div>

            <div className="mt-4 rounded-[1.8rem] border border-white/15 bg-gradient-to-br from-[#153DB5] via-[#4D20AA] to-[#102A8E] p-4 shadow-[0_18px_42px_rgba(0,0,0,0.25)]">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-white/55">
                Today goal
              </p>
              <h2 className="mt-1 text-2xl font-black">Complete 3 English blocks</h2>
              <div className="mt-4 h-3 overflow-hidden rounded-full bg-[#082057]">
                <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-[#FFEF82] via-[#FFC107] to-[#8B38FF]" />
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2">
                <div className="rounded-2xl border border-white/15 bg-white/10 px-3 py-3 text-center">
                  <p className="text-lg font-black text-[#FFCF17]">{tasks.length}</p>
                  <p className="text-[0.62rem] font-black uppercase tracking-wide text-white/55">Quests</p>
                </div>
                <div className="rounded-2xl border border-white/15 bg-white/10 px-3 py-3 text-center">
                  <p className="text-lg font-black text-[#4FB8FF]">{dashboard.cefrTarget}</p>
                  <p className="text-[0.62rem] font-black uppercase tracking-wide text-white/55">CEFR</p>
                </div>
                <div className="rounded-2xl border border-white/15 bg-white/10 px-3 py-3 text-center">
                  <p className="text-lg font-black text-[#39D353]">{dashboard.student.starCoins}</p>
                  <p className="text-[0.62rem] font-black uppercase tracking-wide text-white/55">Coins</p>
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-[2rem] border border-white/15 bg-[#09256B]/75 p-4 shadow-[0_20px_48px_rgba(0,0,0,0.28)]">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#FFCF17]">
                Recommended
              </p>
              <h2 className="mt-1 text-2xl font-black">{requiredTasks[0]?.skillDomain ?? "Reading"}</h2>
              <p className="mt-2 text-sm font-bold leading-6 text-white/65">
                Start with the first required quest. Rewards help your pet gain XP and improve mood.
              </p>
              {requiredTasks[0] ? (
                <Link
                  href={`/student/tasks/${requiredTasks[0].id}`}
                  className="mt-4 grid min-h-14 place-items-center rounded-2xl bg-gradient-to-r from-[#8B38FF] to-[#4FB8FF] text-sm font-black shadow-[0_14px_30px_rgba(79,184,255,0.25)]"
                >
                  Start First Quest
                </Link>
              ) : null}
            </div>
            {!supabaseTasks.length ? (
              <div className="mt-4 rounded-[1.4rem] border border-[#FFCF17]/40 bg-[#FFCF17]/12 p-3 text-xs font-black leading-5 text-[#FFEF82]">
                Demo quests are showing. Real Supabase class tasks will appear here after a teacher publishes assigned tasks.
              </div>
            ) : null}
          </section>

          <section className="grid content-start gap-4">
            <div className="rounded-[2rem] border border-white/15 bg-white/10 p-4 shadow-[0_18px_52px_rgba(0,0,0,0.2)] backdrop-blur">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#FFCF17]">
                Required quests
              </p>
              <h2 className="mt-1 text-2xl font-black">Today&apos;s learning path</h2>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              {requiredTasks.map((task, index) => (
                <Link
                  key={task.id}
                  href={`/student/tasks/${task.id}`}
                  className="rounded-[1.6rem] border border-white/15 bg-gradient-to-br from-[#4FB8FF] via-[#8B38FF] to-[#153DB5] p-4 shadow-[0_16px_38px_rgba(0,0,0,0.2)] transition hover:-translate-y-0.5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white/15 text-lg font-black">
                      {index + 1}
                    </span>
                    <span className="rounded-full bg-[#FFCF17] px-3 py-1 text-[0.68rem] font-black text-[#102A54]">
                      +{task.xpReward} XP
                    </span>
                  </div>
                  <h3 className="mt-4 text-lg font-black">{task.title}</h3>
                  <p className="mt-1 text-sm font-bold leading-5 text-white/70">
                    {task.skillDomain} · CEFR {task.cefrLevel}
                  </p>
                </Link>
              ))}
            </div>

            <div className="rounded-[2rem] border border-white/15 bg-white/10 p-4 shadow-[0_18px_52px_rgba(0,0,0,0.18)] backdrop-blur">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#FFCF17]">
                Bonus quests
              </p>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                {bonusTasks.map((task) => (
                  <Link
                    key={task.id}
                    href={`/student/tasks/${task.id}`}
                    className="rounded-[1.4rem] border border-white/12 bg-[#071E63]/70 p-4 transition hover:-translate-y-0.5"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h3 className="font-black">{task.title}</h3>
                        <p className="mt-1 text-sm font-bold text-white/60">
                          {task.taskBand} · +{task.coinReward} coins
                        </p>
                      </div>
                      <span className="rounded-full bg-white/12 px-3 py-1 text-xs font-black">
                        Start
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
    </DashboardShell>
  );
}
