"use client";

import { useState } from "react";
import type { DailyLearningTile } from "@/lib/daily-learning";

function skillTone(skill: DailyLearningTile["skillDomain"]) {
  const tones: Record<DailyLearningTile["skillDomain"], string> = {
    Reading: "bg-[#7BE0C3]",
    Grammar: "bg-[#FFD95A]",
    Vocabulary: "bg-[#4FB8FF]",
    Writing: "bg-[#FFB199]",
    Speaking: "bg-[#FFF7E2]",
    Listening: "bg-[#EEF2F5]",
  };

  return tones[skill];
}

export function DailyLearningBoard({ tiles }: { tiles: DailyLearningTile[] }) {
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [selectedTile, setSelectedTile] = useState<DailyLearningTile | null>(null);

  function completeTile(tile: DailyLearningTile) {
    setSelectedTile(tile);
    setCompletedIds((current) =>
      current.includes(tile.id) ? current : [...current, tile.id],
    );
  }

  return (
    <section className="rounded-[2rem] border-4 border-[#102A54] bg-[#FFFEF8] p-4 shadow-[6px_6px_0_rgba(16,42,84,0.12)] sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="inline-flex rounded-full border-2 border-[#102A54] bg-[#FFD95A] px-3 py-1 text-[0.68rem] font-black uppercase tracking-[0.16em]">
            Daily learning
          </p>
          <h2 className="mt-3 text-2xl font-black">Today&apos;s learning tiles</h2>
          <p className="mt-2 text-sm font-bold leading-6 text-[#102A54]/60">
            Random daily English practice. Complete tiles to earn rewards and grow your pet.
          </p>
        </div>
        <span className="shrink-0 rounded-2xl border-2 border-[#102A54] bg-[#7BE0C3] px-3 py-2 text-xs font-black shadow-[3px_3px_0_#102A54]">
          {completedIds.length}/{tiles.length}
        </span>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {tiles.map((tile) => {
          const completed = completedIds.includes(tile.id);

          return (
            <button
              type="button"
              key={tile.id}
              onClick={() => completeTile(tile)}
              className={`rounded-[1.5rem] border-2 border-[#102A54] p-4 text-left shadow-[4px_4px_0_rgba(16,42,84,0.12)] transition hover:-translate-y-0.5 ${skillTone(
                tile.skillDomain,
              )}`}
            >
              <div className="flex items-start justify-between gap-2">
                <span className="rounded-full border-2 border-[#102A54] bg-[#FFFEF8] px-3 py-1 text-[0.68rem] font-black uppercase">
                  {tile.skillDomain}
                </span>
                <span className="rounded-full border-2 border-[#102A54] bg-[#FFFEF8] px-2 py-1 text-[0.68rem] font-black">
                  {completed ? "Done" : `${tile.durationMinutes}m`}
                </span>
              </div>
              <h3 className="mt-4 text-lg font-black">{tile.title}</h3>
              <p className="mt-2 text-sm font-bold leading-5 text-[#102A54]/70">
                {tile.prompt}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full border-2 border-[#102A54] bg-[#FFFEF8] px-3 py-1 text-xs font-black">
                  CEFR {tile.cefrLevel}
                </span>
                <span className="rounded-full border-2 border-[#102A54] bg-[#FFFEF8] px-3 py-1 text-xs font-black">
                  +{tile.xpReward} XP
                </span>
                <span className="rounded-full border-2 border-[#102A54] bg-[#FFFEF8] px-3 py-1 text-xs font-black">
                  +{tile.coinReward} coins
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {selectedTile ? (
        <div className="mt-4 rounded-[1.5rem] border-2 border-[#102A54] bg-[#FFF7E2] p-4">
          <p className="text-xs font-black uppercase tracking-wide text-[#FF6B57]">
            Reward result
          </p>
          <p className="mt-2 text-sm font-bold leading-6 text-[#102A54]/70">
            Completed {selectedTile.title}. Earned +{selectedTile.xpReward} XP and +{selectedTile.coinReward} Star Coins.
          </p>
        </div>
      ) : null}
    </section>
  );
}
