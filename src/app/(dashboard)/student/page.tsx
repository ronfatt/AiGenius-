import Image from "next/image";
import Link from "next/link";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { getCurrentProfile } from "@/lib/auth";
import { getDailyLearningTiles } from "@/lib/daily-learning";
import { getStudentDashboard, getStudentDashboardFromSupabase } from "@/lib/dashboard-data";
import { getCurrentPetEmotion } from "@/lib/pet-emotions";
import { adminTable } from "@/lib/supabase-admin-tables";

type CurrentStudentCode = {
  referral_code: string | null;
};

async function getCurrentStudentCode() {
  try {
    const profile = await getCurrentProfile();

    if (!profile || profile.role !== "student") return null;

    const { data } = await adminTable("student_profiles")
      .select("referral_code")
      .eq("user_id", profile.id)
      .maybeSingle<CurrentStudentCode>();

    return {
      studentName: profile.name,
      referralCode: data?.referral_code ?? null,
    };
  } catch {
    return null;
  }
}

function AppIcon({ label, tone }: { label: string; tone: string }) {
  return (
    <span
      className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-white/25 text-lg font-black text-white shadow-[0_10px_24px_rgba(0,0,0,0.18)] ${tone}`}
    >
      {label}
    </span>
  );
}

function MetricPill({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: string;
}) {
  return (
    <div className="rounded-3xl border border-white/15 bg-white/10 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.22)] backdrop-blur">
      <p className="text-[0.62rem] font-black uppercase tracking-[0.16em] text-white/55">
        {label}
      </p>
      <p className={`mt-1 text-lg font-black ${tone}`}>{value}</p>
    </div>
  );
}

function ProgressRail({ value }: { value: number }) {
  return (
    <div className="h-3 overflow-hidden rounded-full bg-[#082057] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.18)]">
      <div
        className="h-full rounded-full bg-gradient-to-r from-[#FFEF82] via-[#FFC107] to-[#8B38FF] shadow-[0_0_18px_rgba(255,193,7,0.55)]"
        style={{ width: `${Math.max(4, Math.min(100, value))}%` }}
      />
    </div>
  );
}

export default async function StudentDashboard() {
  const currentProfile = await getCurrentProfile().catch(() => null);
  const liveDashboard =
    currentProfile?.role === "student"
      ? await getStudentDashboardFromSupabase(currentProfile.id)
      : null;
  const dashboard = liveDashboard ?? getStudentDashboard();
  const currentStudentCode = await getCurrentStudentCode();
  const currentEmotion = getCurrentPetEmotion(dashboard.pet);
  const dailyTiles = getDailyLearningTiles();
  const requiredTiles = dailyTiles.filter((tile) => tile.group === "required");
  const requiredDone = 2;
  const xpProgress = dashboard.pet.xp % 1000;
  const studentName = currentStudentCode?.studentName ?? dashboard.studentName;
  const referralCode = currentStudentCode?.referralCode ?? dashboard.student.referralCode;

  return (
    <DashboardShell title="Student Dashboard" immersive>
      <div className="min-h-screen overflow-hidden bg-[#071E63] bg-[radial-gradient(circle_at_18%_8%,rgba(79,184,255,0.55),transparent_28%),radial-gradient(circle_at_82%_16%,rgba(139,56,255,0.45),transparent_24%),linear-gradient(180deg,#061956_0%,#0B2F86_48%,#142C7D_100%)] px-4 pb-28 pt-4 text-white sm:px-6 lg:p-6 lg:pb-8">
        <div className="mx-auto grid max-w-6xl gap-5 xl:grid-cols-[430px_1fr]">
          <section className="relative mx-auto w-full max-w-[430px] overflow-hidden rounded-[2.2rem] border border-white/20 bg-[#08256F]/85 p-4 shadow-[0_24px_80px_rgba(0,0,0,0.25)] backdrop-blur">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_24%_18%,rgba(255,255,255,0.22)_0_1px,transparent_2px),radial-gradient(circle_at_72%_30%,rgba(255,255,255,0.16)_0_1px,transparent_2px),radial-gradient(circle_at_42%_72%,rgba(255,255,255,0.12)_0_1px,transparent_2px)]" />

            <div className="relative z-10 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="relative h-12 w-12 overflow-hidden rounded-2xl border border-white/25 bg-white/10">
                  <Image
                    src="/aigenius-logo.png"
                    alt="AiGenius"
                    width={80}
                    height={80}
                    className="h-full w-full object-cover"
                    priority
                  />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-[#FFCF17]">
                    StarPet Academy · {liveDashboard ? "Live" : "Demo"}
                  </p>
                  <h1 className="text-xl font-black">Hi, {studentName.split(" ")[0]}</h1>
                </div>
              </div>
              <button
                type="button"
                aria-label="Notifications"
                className="grid h-11 w-11 place-items-center rounded-2xl border border-white/20 bg-white/10 text-xl font-black text-white shadow-[0_10px_24px_rgba(0,0,0,0.18)]"
              >
                !
              </button>
            </div>

            <div className="relative z-10 mt-4 rounded-[1.8rem] border border-white/15 bg-gradient-to-br from-[#153DB5] via-[#4D20AA] to-[#102A8E] p-4 shadow-[0_18px_42px_rgba(0,0,0,0.25)]">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-white/55">
                    Star Coins
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="grid h-9 w-9 place-items-center rounded-full bg-[#FFCF17] text-lg font-black text-[#102A54] shadow-[0_0_22px_rgba(255,207,23,0.45)]">
                      S
                    </span>
                    <p className="text-3xl font-black text-white">
                      {dashboard.student.starCoins}
                    </p>
                  </div>
                </div>
                <div className="rounded-[1.3rem] border border-[#FFCF17]/60 bg-[#102A54]/55 px-4 py-3 text-center">
                  <p className="text-xs font-black text-[#FFCF17]">Level</p>
                  <p className="text-3xl font-black">{dashboard.pet.level}</p>
                </div>
              </div>
              <div className="mt-4">
                <div className="mb-2 flex justify-between text-xs font-black text-white/70">
                  <span>XP</span>
                  <span>{xpProgress} / 1000</span>
                </div>
                <ProgressRail value={xpProgress / 10} />
              </div>
            </div>

            <div className="relative z-10 mt-4 overflow-hidden rounded-[2rem] border border-white/18 bg-gradient-to-b from-[#12389B] to-[#09256B] p-4 text-center shadow-[0_20px_48px_rgba(0,0,0,0.28)]">
              <div className="absolute inset-x-8 bottom-16 h-16 rounded-full bg-[#4FB8FF]/25 blur-2xl" />
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#FFCF17]">
                Active pet
              </p>
              <h2 className="mt-1 text-2xl font-black">{dashboard.pet.name}</h2>
              <p className="mt-1 text-sm font-bold text-white/65">
                {currentEmotion.label} · {dashboard.pet.stage}
              </p>
              <div className="relative mx-auto mt-4 h-72 w-72 max-w-full">
                <div className="absolute inset-x-8 bottom-3 h-10 rounded-full bg-black/25 blur-xl" />
                <Image
                  src={currentEmotion.imageUrl}
                  alt={dashboard.pet.name}
                  width={360}
                  height={360}
                  className="pet-bounce relative z-10 h-full w-full rounded-[2.2rem] object-cover drop-shadow-[0_22px_32px_rgba(0,0,0,0.35)]"
                  priority
                />
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2">
                <MetricPill label="Streak" value={`${dashboard.student.streakDays}d`} tone="text-[#7BE0C3]" />
                <MetricPill label="Mood" value={currentEmotion.label} tone="text-[#FFCF17]" />
                <MetricPill label="Code" value={referralCode} tone="text-white" />
              </div>
            </div>

            <div className="relative z-10 mt-4 grid grid-cols-4 gap-2">
              {[
                { href: "/student/cards", label: "Cards", icon: "C", tone: "bg-gradient-to-br from-[#8B38FF] to-[#4D20AA]" },
                { href: "/student/explore", label: "Explore", icon: "E", tone: "bg-gradient-to-br from-[#10B981] to-[#1684D8]" },
                { href: "/pets", label: "Pet", icon: "P", tone: "bg-gradient-to-br from-[#FFB000] to-[#FF6B57]" },
                { href: "/battle", label: "Battle", icon: "B", tone: "bg-gradient-to-br from-[#3B82F6] to-[#1D4ED8]" },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-[1.4rem] border border-white/15 bg-white/10 p-2 text-center shadow-[0_12px_30px_rgba(0,0,0,0.18)] transition hover:-translate-y-0.5"
                >
                  <AppIcon label={item.icon} tone={item.tone} />
                  <span className="mt-2 block text-[0.68rem] font-black text-white/85">
                    {item.label}
                  </span>
                </Link>
              ))}
            </div>
          </section>

          <section className="grid content-start gap-4">
            <div className="rounded-[2rem] border border-white/15 bg-white/10 p-4 shadow-[0_18px_52px_rgba(0,0,0,0.2)] backdrop-blur">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-[#FFCF17]">
                    Daily mission
                  </p>
                  <h2 className="mt-1 text-2xl font-black">Complete 3 learning blocks</h2>
                </div>
                <span className="rounded-2xl bg-[#39D353] px-4 py-2 text-sm font-black text-[#05245F]">
                  {requiredDone}/3
                </span>
              </div>
              <div className="mt-4">
                <ProgressRail value={(requiredDone / 3) * 100} />
              </div>
              <Link
                href="/student/tasks"
                className="mt-4 grid min-h-14 place-items-center rounded-2xl bg-gradient-to-r from-[#8B38FF] to-[#4FB8FF] text-sm font-black text-white shadow-[0_14px_30px_rgba(79,184,255,0.25)] transition hover:-translate-y-0.5"
              >
                Continue English Quest
              </Link>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              {requiredTiles.slice(0, 3).map((tile, index) => {
                const done = index < requiredDone;
                const tones = [
                  "from-[#4FB8FF] to-[#0D47A1]",
                  "from-[#8B38FF] to-[#4D20AA]",
                  "from-[#FFB000] to-[#FF6B57]",
                ];

                return (
                  <Link
                    key={tile.id}
                    href="/student/tasks"
                    className={`rounded-[1.6rem] border border-white/15 bg-gradient-to-br ${tones[index]} p-4 shadow-[0_16px_38px_rgba(0,0,0,0.2)] transition hover:-translate-y-0.5`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <AppIcon
                        label={tile.skillDomain.slice(0, 1)}
                        tone="bg-white/15"
                      />
                      <span className="rounded-full bg-white/18 px-3 py-1 text-[0.68rem] font-black text-white">
                        {done ? "Done" : `${tile.durationMinutes}m`}
                      </span>
                    </div>
                    <h3 className="mt-4 text-lg font-black">{tile.skillDomain}</h3>
                    <p className="mt-1 line-clamp-2 text-sm font-bold leading-5 text-white/72">
                      {tile.title}
                    </p>
                    <div className="mt-4 flex gap-2 text-[0.68rem] font-black">
                      <span className="rounded-full bg-white/18 px-3 py-1">
                        +{tile.xpReward} XP
                      </span>
                      <span className="rounded-full bg-[#FFCF17] px-3 py-1 text-[#102A54]">
                        +{tile.coinReward}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>

            <div className="grid gap-4 lg:grid-cols-[1fr_0.9fr]">
              <div className="rounded-[2rem] border border-white/15 bg-white/10 p-4 shadow-[0_18px_52px_rgba(0,0,0,0.18)] backdrop-blur">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-[#FFCF17]">
                  Evolution path
                </p>
                <h2 className="mt-1 text-2xl font-black">Next form is waiting</h2>
                <div className="mt-4 flex items-center gap-3 overflow-hidden rounded-[1.5rem] bg-[#071E63]/70 p-3">
                  {[0, 1, 2].map((step) => (
                    <div key={step} className="flex flex-1 items-center gap-2">
                      <div
                        className={`grid h-14 w-14 place-items-center rounded-2xl border border-white/20 ${
                          step === 0 ? "bg-[#FFCF17] text-[#102A54]" : "bg-white/10 text-white"
                        } text-sm font-black`}
                      >
                        {step === 0 ? "Now" : `S${step + 1}`}
                      </div>
                      {step < 2 ? <div className="h-1 flex-1 rounded-full bg-white/20" /> : null}
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-sm font-bold leading-6 text-white/62">
                  Learning streak, completed quests, and teacher rewards push
                  the pet toward its next evolution.
                </p>
              </div>

              <div className="rounded-[2rem] border border-white/15 bg-gradient-to-br from-[#FFCF17] to-[#FF8A00] p-4 text-[#102A54] shadow-[0_18px_52px_rgba(0,0,0,0.18)]">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-[#102A54]/60">
                  Reward chest
                </p>
                <h2 className="mt-1 text-2xl font-black">Streak chest ready soon</h2>
                <p className="mt-2 text-sm font-bold leading-6 text-[#102A54]/72">
                  Finish one more required block to claim XP, coins, or a rare
                  chance ticket.
                </p>
                <Link
                  href="/student/cards"
                  className="mt-4 inline-flex rounded-2xl bg-[#102A54] px-5 py-3 text-sm font-black text-white shadow-[0_12px_24px_rgba(16,42,84,0.22)]"
                >
                  Open rewards
                </Link>
              </div>
            </div>
          </section>
        </div>
      </div>
    </DashboardShell>
  );
}
