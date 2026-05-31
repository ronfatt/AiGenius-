import Link from "next/link";

export function TodayGoalPanel({
  requiredDone,
  requiredTotal,
}: {
  requiredDone: number;
  requiredTotal: number;
}) {
  const progress = Math.min(100, Math.round((requiredDone / requiredTotal) * 100));

  return (
    <section className="mb-4 rounded-[2rem] border-4 border-[#102A54] bg-[#FFFEF8] p-4 shadow-[6px_6px_0_rgba(16,42,84,0.12)] sm:p-5">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="inline-flex rounded-full border-2 border-[#102A54] bg-[#7BE0C3] px-3 py-1 text-[0.68rem] font-black uppercase tracking-[0.16em]">
            Today goal
          </p>
          <h2 className="mt-3 text-2xl font-black">Complete 3 English tiles</h2>
          <p className="mt-2 text-sm font-bold text-[#102A54]/65">
            Reward: Streak Chest, Normal Tickets, and pet growth.
          </p>
        </div>
        <Link
          href="/student/cards"
          className="rounded-2xl border-2 border-[#102A54] bg-[#FFD95A] px-5 py-4 text-center text-sm font-black shadow-[4px_4px_0_#102A54] transition hover:-translate-y-0.5"
        >
          Rewards
        </Link>
      </div>
      <div className="mt-4">
        <div className="mb-2 flex justify-between text-xs font-black uppercase tracking-wide text-[#102A54]/60">
          <span>Goal progress</span>
          <span>{requiredDone}/{requiredTotal}</span>
        </div>
        <div className="h-4 overflow-hidden rounded-full border-2 border-[#102A54] bg-[#FFF7E2]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#7BE0C3] via-[#4FB8FF] to-[#FFD95A]"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </section>
  );
}
