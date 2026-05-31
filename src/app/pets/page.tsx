import { PetCard } from "@/components/cards/PetCard";
import { SkillRadarChart } from "@/components/charts/SkillRadarChart";
import { EvolutionPath } from "@/components/game/EvolutionPath";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { pets } from "@/lib/mock-data";

const stageIndex = {
  baby: 0,
  junior: 1,
  advanced: 2,
  legendary: 3,
};

export default function PetsPage() {
  const pet = pets[0];
  const stats = {
    power: pet.power,
    wisdom: pet.wisdom,
    speed: pet.speed,
    focus: pet.focus,
    courage: pet.courage,
    kindness: pet.kindness,
  };

  return (
    <DashboardShell title="Pet System">
      <div className="grid gap-4 lg:grid-cols-[1fr_0.9fr]">
        <PetCard pet={pet} />
        <SkillRadarChart stats={stats} />
      </div>
      <section className="mt-5 rounded-[1.5rem] border border-blue-100 bg-white p-5 shadow-sm">
        <h2 className="text-2xl font-black text-slate-950">Evolution path</h2>
        <div className="mt-4">
          <EvolutionPath stage={stageIndex[pet.stage]} />
        </div>
      </section>
    </DashboardShell>
  );
}
