import type { Pet } from "@/lib/types";
import { PetAvatar } from "../game/PetAvatar";
import { XPBar } from "../game/XPBar";

const stageIndex = {
  baby: 0,
  junior: 1,
  advanced: 2,
  legendary: 3,
};

export function PetCard({ pet }: { pet: Pet }) {
  return (
    <section className="rounded-[1.75rem] border-4 border-[#102A54] bg-gradient-to-br from-[#4FB8FF] via-[#7BE0C3] to-[#FFD95A] p-5 text-[#102A54] shadow-[8px_8px_0_rgba(16,42,84,0.16)]">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="inline-flex rounded-full border-2 border-[#102A54] bg-[#FFF7E2] px-3 py-1 text-xs font-black uppercase tracking-wide">
            Pet profile
          </p>
          <h3 className="mt-3 text-3xl font-black">{pet.name}</h3>
          <p className="mt-1 text-sm font-bold text-[#102A54]/75">
            {pet.species} · Level {pet.level}
          </p>
        </div>
        <PetAvatar
          stage={stageIndex[pet.stage]}
          imageUrl={pet.imageUrl}
          name={pet.name}
        />
      </div>
      <div className="mt-5">
        <XPBar xp={pet.xp} />
      </div>
    </section>
  );
}
