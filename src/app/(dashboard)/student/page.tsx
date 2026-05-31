import Link from "next/link";
import { DailyLearningBoard } from "@/components/game/DailyLearningBoard";
import { DailyStreakChest } from "@/components/game/DailyStreakChest";
import { PetCarePanel } from "@/components/game/PetCarePanel";
import { PetAvatar } from "@/components/game/PetAvatar";
import { StarCoinBadge } from "@/components/game/StarCoinBadge";
import { TodayGoalPanel } from "@/components/game/TodayGoalPanel";
import { XPBar } from "@/components/game/XPBar";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Card } from "@/components/ui";
import { getDailyLearningTiles } from "@/lib/daily-learning";
import { getPetStageIndex, getStudentDashboard } from "@/lib/dashboard-data";

export default function StudentDashboard() {
  const dashboard = getStudentDashboard();
  const dailyTiles = getDailyLearningTiles();
  const requiredTotal = dailyTiles.filter((tile) => tile.group === "required").length;
  const requiredDone = 2;

  return (
    <DashboardShell title="Student Dashboard">
      <section className="mb-4 overflow-hidden rounded-[2rem] border-4 border-[#102A54] bg-gradient-to-br from-[#4FB8FF] via-[#7BE0C3] to-[#FFD95A] p-4 text-[#102A54] shadow-[6px_6px_0_rgba(16,42,84,0.16)] sm:p-5 lg:rounded-[2.2rem]">
        <div className="grid gap-5 lg:grid-cols-[1fr_320px] lg:items-center">
          <div className="relative z-10">
            <p className="inline-flex rounded-full border-2 border-[#102A54] bg-[#FFF7E2] px-3 py-1 text-[0.68rem] font-black uppercase tracking-[0.16em]">
              Pet adventure
            </p>
            <h2 className="mt-3 text-xl font-black sm:text-4xl">
              Hi, {dashboard.studentName}
            </h2>
            <h1 className="mt-1 text-3xl font-black sm:text-5xl">
              {dashboard.pet.name}
            </h1>
            <div className="mt-3 grid grid-cols-3 gap-2 sm:flex sm:flex-wrap">
              <span className="rounded-2xl border-2 border-[#102A54] bg-[#FFF7E2] px-3 py-2 text-center text-xs font-black shadow-[3px_3px_0_#102A54] sm:rounded-full sm:px-4 sm:text-sm">
                Lv {dashboard.pet.level} · {dashboard.pet.stage}
              </span>
              <StarCoinBadge coins={dashboard.student.starCoins} />
              <span className="rounded-2xl border-2 border-[#102A54] bg-[#FFF7E2] px-3 py-2 text-center text-xs font-black shadow-[3px_3px_0_#102A54] sm:rounded-full sm:px-4 sm:text-sm">
                Streak {dashboard.student.streakDays} days
              </span>
            </div>
            <div className="mt-4 max-w-xl rounded-[1.4rem] border-2 border-[#102A54] bg-[#FFFEF8]/90 p-3 sm:p-4">
              <XPBar xp={dashboard.pet.xp} />
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 sm:flex sm:flex-wrap sm:gap-3">
              <Link
                href="/student/tasks"
                className="rounded-2xl border-2 border-[#102A54] bg-[#FFD95A] px-3 py-3 text-center text-xs font-black shadow-[4px_4px_0_#102A54] transition hover:-translate-y-0.5 sm:px-5 sm:py-4 sm:text-sm"
              >
                Quest
              </Link>
              <Link
                href="/battle"
                className="rounded-2xl border-2 border-[#102A54] bg-[#FFB199] px-3 py-3 text-center text-xs font-black shadow-[4px_4px_0_#102A54] transition hover:-translate-y-0.5 sm:px-5 sm:py-4 sm:text-sm"
              >
                Battle
              </Link>
              <Link
                href="/student/explore"
                className="rounded-2xl border-2 border-[#102A54] bg-[#7BE0C3] px-3 py-3 text-center text-xs font-black shadow-[4px_4px_0_#102A54] transition hover:-translate-y-0.5 sm:px-5 sm:py-4 sm:text-sm"
              >
                Explore
              </Link>
            </div>
          </div>
          <div className="mx-auto rounded-[2.6rem] border-4 border-[#102A54] bg-[#FFFEF8]/80 p-3 shadow-[6px_6px_0_rgba(16,42,84,0.18)] sm:rounded-[3.5rem] sm:p-5">
            <PetAvatar
              stage={getPetStageIndex(dashboard.pet)}
              imageUrl={dashboard.pet.imageUrl}
              name={dashboard.pet.name}
              size="lg"
            />
          </div>
        </div>
      </section>

      <TodayGoalPanel requiredDone={requiredDone} requiredTotal={requiredTotal} />

      <div className="mt-3 sm:mt-4">
        <DailyLearningBoard tiles={dailyTiles} />
      </div>

      <div className="mt-3 grid gap-3 sm:mt-4 sm:gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <DailyStreakChest
          streakDays={dashboard.student.streakDays}
          completedTiles={requiredDone}
          totalTiles={requiredTotal}
        />
        <PetCarePanel pet={dashboard.pet} />
      </div>

      <div className="mt-3 grid gap-3 sm:mt-4 sm:gap-4 xl:grid-cols-3">
        <Card className="bg-gradient-to-br from-[#FFF7E2] to-[#7BE0C3]/35">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#FF6B57]">
            Explore
          </p>
          <h2 className="mt-2 text-2xl font-black">Tawau adventure</h2>
          <p className="mt-2 text-sm font-bold leading-6 text-[#102A54]/65">
            Send your pet out with a timer and return for rewards.
          </p>
          <Link href="/student/explore" className="mt-4 inline-flex rounded-2xl border-2 border-[#102A54] bg-[#7BE0C3] px-5 py-3 text-sm font-black shadow-[4px_4px_0_#102A54]">
            Explore
          </Link>
        </Card>
        <Card className="bg-gradient-to-br from-[#FFF7E2] to-[#FFD95A]/50">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#FF6B57]">
            Collect
          </p>
          <h2 className="mt-2 text-2xl font-black">Blind boxes</h2>
          <p className="mt-2 text-sm font-bold leading-6 text-[#102A54]/65">
            Use coins and tickets. Rare Box needs a Rare Chance Ticket.
          </p>
          <Link href="/student/cards" className="mt-4 inline-flex rounded-2xl border-2 border-[#102A54] bg-[#FFD95A] px-5 py-3 text-sm font-black shadow-[4px_4px_0_#102A54]">
            Draw
          </Link>
        </Card>
        <Card className="bg-gradient-to-br from-[#FFF7E2] to-[#FFB199]/60">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#FF6B57]">
            Challenge
          </p>
          <h2 className="mt-2 text-2xl font-black">Quiz battle</h2>
          <p className="mt-2 text-sm font-bold leading-6 text-[#102A54]/65">
            Optional text battle for students who enjoy challenge.
          </p>
          <Link href="/battle" className="mt-4 inline-flex rounded-2xl border-2 border-[#102A54] bg-[#FFB199] px-5 py-3 text-sm font-black shadow-[4px_4px_0_#102A54]">
            Battle
          </Link>
        </Card>
      </div>
    </DashboardShell>
  );
}
