import Link from "next/link";
import Image from "next/image";
import { getPetCareState } from "@/lib/exploration";
import { getCurrentPetEmotion, getPetEmotionSet } from "@/lib/pet-emotions";
import type { Pet } from "@/lib/types";

function CareMeter({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-xs font-black uppercase tracking-wide text-[#102A54]/60">
        <span>{label}</span>
        <span>{Math.round(value)}%</span>
      </div>
      <div className="h-3 overflow-hidden rounded-full border-2 border-[#102A54] bg-[#FFFEF8]">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#7BE0C3] to-[#FFD95A]"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

export function PetCarePanel({ pet }: { pet: Pet }) {
  const care = getPetCareState(pet);
  const currentEmotion = getCurrentPetEmotion(pet);
  const emotions = getPetEmotionSet(pet);

  return (
    <section className="rounded-[2rem] border-4 border-[#102A54] bg-[#FFFEF8] p-5 shadow-[8px_8px_0_rgba(16,42,84,0.12)]">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div>
          <p className="inline-flex rounded-full border-2 border-[#102A54] bg-[#FFB199] px-3 py-1 text-xs font-black uppercase tracking-[0.16em]">
            Pet care
          </p>
          <h2 className="mt-3 text-2xl font-black">Daily growth</h2>
        </div>
        <Link
          href="/student/explore"
          className="rounded-2xl border-2 border-[#102A54] bg-[#7BE0C3] px-4 py-3 text-center text-sm font-black shadow-[4px_4px_0_#102A54] transition hover:-translate-y-0.5"
        >
          Explore Tawau
        </Link>
      </div>

      <div className="mt-5 grid gap-4">
        <CareMeter label="Mood" value={care.mood} />
        <CareMeter label="Energy" value={care.energy} />
        <CareMeter label="Bond" value={care.bond} />
      </div>

      <div className="mt-5 rounded-[1.5rem] border-2 border-[#102A54]/20 bg-[#FFF7E2] p-4">
        <div className="flex items-center gap-3">
          <div className="relative h-16 w-16 overflow-hidden rounded-2xl border-2 border-[#102A54] bg-[#FFFEF8]">
            <Image
              src={currentEmotion.imageUrl}
              alt={`${pet.name} ${currentEmotion.label}`}
              width={128}
              height={128}
              className="h-full w-full object-cover"
            />
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-wide text-[#FF6B57]">
              Current emotion
            </p>
            <h3 className="text-xl font-black">{currentEmotion.label}</h3>
            <p className="text-xs font-bold text-[#102A54]/60">{currentEmotion.message}</p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-7 gap-2">
          {emotions.map((emotion) => (
            <div
              key={emotion.emotion}
              className={`overflow-hidden rounded-xl border-2 bg-[#FFFEF8] ${
                emotion.emotion === currentEmotion.emotion
                  ? "border-[#102A54] shadow-[2px_2px_0_#102A54]"
                  : "border-[#102A54]/20"
              }`}
              title={emotion.label}
            >
              <Image
                src={emotion.imageUrl}
                alt={emotion.label}
                width={72}
                height={72}
                className="aspect-square w-full object-cover"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {["Feed", "Rest", "Praise"].map((action) => (
          <button
            type="button"
            key={action}
            className="rounded-2xl border-2 border-[#102A54] bg-[#FFF7E2] px-4 py-3 text-sm font-black shadow-[3px_3px_0_rgba(16,42,84,0.16)] transition hover:-translate-y-0.5 hover:bg-[#FFD95A]"
          >
            {action}
          </button>
        ))}
      </div>
    </section>
  );
}
