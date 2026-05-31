import type { PetStats } from "@/lib/types";

export function SkillRadarChart({ stats }: { stats: PetStats }) {
  const entries = Object.entries(stats);

  return (
    <section className="rounded-[1.6rem] border-2 border-[#102A54] bg-[#FFFEF8] p-5 shadow-[5px_5px_0_rgba(16,42,84,0.12)]">
      <h3 className="text-lg font-black text-[#102A54]">Pet skills</h3>
      <div className="mt-4 grid gap-3">
        {entries.map(([skill, value]) => (
          <div key={skill}>
            <div className="mb-1 flex justify-between text-xs font-black uppercase text-[#102A54]/60">
              <span>{skill}</span>
              <span>{value}</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full border-2 border-[#102A54] bg-[#EEF2F5]">
              <div
                className="progress-fill h-full rounded-full bg-[#7BE0C3]"
                style={{ width: `${value}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
