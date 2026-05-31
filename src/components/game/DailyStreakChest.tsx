import Link from "next/link";

export function DailyStreakChest({
  streakDays,
  completedTiles,
  totalTiles,
}: {
  streakDays: number;
  completedTiles: number;
  totalTiles: number;
}) {
  const progress = Math.min(100, Math.round((completedTiles / totalTiles) * 100));
  const rareTickets = streakDays >= 7 ? 1 : 0;

  return (
    <section className="rounded-[2rem] border-4 border-[#102A54] bg-gradient-to-br from-[#FFD95A] to-[#FFB199] p-4 shadow-[6px_6px_0_rgba(16,42,84,0.14)] sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="inline-flex rounded-full border-2 border-[#102A54] bg-[#FFFEF8] px-3 py-1 text-[0.68rem] font-black uppercase tracking-[0.16em]">
            Streak chest
          </p>
          <h2 className="mt-3 text-2xl font-black">Daily reward chest</h2>
          <p className="mt-2 text-sm font-bold leading-6 text-[#102A54]/70">
            Finish today&apos;s learning tiles to claim tickets for the blind box zone.
          </p>
        </div>
        <div className="rounded-2xl border-2 border-[#102A54] bg-[#FFFEF8] px-4 py-3 text-center shadow-[3px_3px_0_#102A54]">
          <p className="text-2xl font-black">{streakDays}</p>
          <p className="text-[0.65rem] font-black uppercase text-[#102A54]/60">days</p>
        </div>
      </div>

      <div className="mt-5">
        <div className="mb-2 flex justify-between text-xs font-black uppercase tracking-wide text-[#102A54]/65">
          <span>Today progress</span>
          <span>{completedTiles}/{totalTiles}</span>
        </div>
        <div className="h-4 overflow-hidden rounded-full border-2 border-[#102A54] bg-[#FFFEF8]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#7BE0C3] to-[#4FB8FF]"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-2">
        <div className="rounded-2xl border-2 border-[#102A54] bg-[#FFFEF8] p-3 text-center">
          <p className="text-xl font-black">2</p>
          <p className="text-[0.65rem] font-black uppercase text-[#102A54]/60">Normal Tickets</p>
        </div>
        <div className="rounded-2xl border-2 border-[#102A54] bg-[#FFFEF8] p-3 text-center">
          <p className="text-xl font-black">1</p>
          <p className="text-[0.65rem] font-black uppercase text-[#102A54]/60">Star Ticket</p>
        </div>
        <div className="rounded-2xl border-2 border-[#102A54] bg-[#FFFEF8] p-3 text-center">
          <p className="text-xl font-black">{rareTickets}</p>
          <p className="text-[0.65rem] font-black uppercase text-[#102A54]/60">Rare Ticket</p>
        </div>
      </div>

      <Link
        href="/student/cards"
        className="mt-5 inline-flex w-full justify-center rounded-2xl border-2 border-[#102A54] bg-[#FFFEF8] px-5 py-4 text-sm font-black shadow-[4px_4px_0_#102A54] transition hover:-translate-y-0.5"
      >
        Go to Blind Boxes
      </Link>
    </section>
  );
}
