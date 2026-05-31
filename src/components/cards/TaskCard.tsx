import type { LearningTask } from "@/lib/types";

export function TaskCard({ task }: { task: LearningTask }) {
  return (
    <section className="rounded-[1.6rem] border-2 border-[#102A54] bg-[#FFFEF8] p-5 shadow-[4px_4px_0_rgba(16,42,84,0.1)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="inline-flex rounded-full bg-[#7BE0C3] px-3 py-1 text-xs font-black uppercase tracking-wide text-[#102A54]">
            {task.subject}
          </p>
          <h3 className="mt-3 text-lg font-black text-[#102A54]">{task.title}</h3>
          <p className="mt-2 text-sm leading-6 text-[#102A54]/65">{task.description}</p>
        </div>
        <span className="rounded-full border-2 border-[#102A54] bg-[#EEF2F5] px-3 py-1 text-xs font-black text-[#102A54]">
          {task.dueDate}
        </span>
      </div>
      <p className="mt-4 inline-flex rounded-full border-2 border-[#102A54] bg-[#FFD95A] px-3 py-1 text-sm font-black text-[#102A54]">
        +{task.xpReward} XP · +{task.coinReward} coins
      </p>
    </section>
  );
}
