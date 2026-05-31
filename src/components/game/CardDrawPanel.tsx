import type { PetCard } from "@/lib/types";

export function CardDrawPanel({ cards }: { cards: PetCard[] }) {
  return (
    <section className="rounded-[1.6rem] border-2 border-[#102A54] bg-[#FFFEF8] p-5 shadow-[5px_5px_0_rgba(16,42,84,0.12)]">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="inline-flex rounded-full bg-[#FFB199] px-3 py-1 text-sm font-black text-[#102A54]">Card draw</p>
          <h3 className="mt-2 text-xl font-black text-[#102A54]">Boost your pet</h3>
        </div>
        <button className="rounded-full border-2 border-[#102A54] bg-[#FFD95A] px-4 py-2 text-sm font-black text-[#102A54] shadow-[3px_3px_0_#102A54] transition hover:-translate-y-0.5">
          Draw
        </button>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {cards.map((card) => (
          <div key={card.id} className="rounded-2xl border-2 border-[#102A54] bg-[#FFF7E2] p-4 shadow-[3px_3px_0_rgba(16,42,84,0.12)]">
            <p className="font-black text-[#102A54]">{card.name}</p>
            <p className="mt-1 text-xs font-black uppercase text-[#FF6B57]">
              {card.rarity} · {card.type}
            </p>
            <p className="mt-2 text-xs font-bold leading-5 text-[#102A54]/60">
              {card.effect}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
