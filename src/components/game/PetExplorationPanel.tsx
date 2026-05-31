"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  getPetCareState,
  getRandomExploration,
  tawauExplorationLocations,
  type ExplorationLocation,
} from "@/lib/exploration";
import { getCurrentPetEmotion, getPetEmotionImageUrl } from "@/lib/pet-emotions";
import type { Pet } from "@/lib/types";

function ProgressRail({ value }: { value: number }) {
  return (
    <div className="h-3 overflow-hidden rounded-full bg-[#082057] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.18)]">
      <div
        className="h-full rounded-full bg-gradient-to-r from-[#FFEF82] via-[#FFC107] to-[#39D353] shadow-[0_0_18px_rgba(255,193,7,0.55)]"
        style={{ width: `${Math.max(4, Math.min(100, value))}%` }}
      />
    </div>
  );
}

function LocationCard({
  location,
  selected,
  onSelect,
}: {
  location: ExplorationLocation;
  selected: boolean;
  onSelect: () => void;
}) {
  const tone =
    location.difficulty === "rare"
      ? "from-[#FFCF17] via-[#FF6B57] to-[#8B38FF]"
      : location.difficulty === "normal"
        ? "from-[#4FB8FF] via-[#8B38FF] to-[#39D353]"
        : "from-[#153DB5] to-[#0B2F86]";

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`rounded-[1.6rem] border border-white/15 bg-gradient-to-br ${tone} p-4 text-left shadow-[0_16px_38px_rgba(0,0,0,0.2)] transition hover:-translate-y-0.5 ${
        selected ? "ring-4 ring-[#FFCF17]/45" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#FFCF17]">
            {location.area}
          </p>
          <h3 className="mt-2 text-lg font-black text-white">{location.name}</h3>
        </div>
        <span className="rounded-full bg-white/18 px-3 py-1 text-[0.68rem] font-black uppercase text-white">
          {location.difficulty}
        </span>
      </div>
      <div className="mt-4 flex gap-2 text-[0.68rem] font-black">
        <span className="rounded-full bg-white/18 px-3 py-1">
          {location.durationMinutes}s
        </span>
        <span className="rounded-full bg-[#FFCF17] px-3 py-1 text-[#102A54]">
          +{location.rewardXp} XP
        </span>
      </div>
    </button>
  );
}

export function PetExplorationPanel({ pet }: { pet: Pet }) {
  const [selectedId, setSelectedId] = useState(tawauExplorationLocations[0].id);
  const [active, setActive] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [remainingMinutes, setRemainingMinutes] = useState(0);
  const [log, setLog] = useState<string[]>([
    "Choose a Tawau location and send your pet out for a gentle learning adventure.",
  ]);
  const care = getPetCareState(pet);
  const currentEmotion = getCurrentPetEmotion(pet);

  const selectedLocation = useMemo(
    () =>
      tawauExplorationLocations.find((location) => location.id === selectedId) ??
      tawauExplorationLocations[0],
    [selectedId],
  );
  const canExplore = care.energy >= 60;
  const rewardBonus = Math.round((care.mood + care.bond) / 40);
  const adjustedXp = selectedLocation.rewardXp + rewardBonus;
  const adjustedCoins = selectedLocation.rewardCoins + Math.max(1, Math.round(rewardBonus / 2));
  const timerProgress = active
    ? (remainingMinutes / selectedLocation.durationMinutes) * 100
    : completed
      ? 100
      : 0;

  useEffect(() => {
    if (!active || remainingMinutes <= 0) return;

    const timer = window.setInterval(() => {
      setRemainingMinutes((current) => {
        const next = Math.max(0, current - 1);
        if (next === 0) {
          setLog((messages) => ["Your pet is back. Claim the return reward.", ...messages]);
        }
        return next;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [active, remainingMinutes]);

  function startExploration(location = selectedLocation) {
    if (!canExplore) {
      setLog([
        `${pet.name} needs more Energy before exploring. Use Rest or complete lighter learning first.`,
      ]);
      return;
    }

    setSelectedId(location.id);
    setActive(true);
    setCompleted(false);
    setRemainingMinutes(location.durationMinutes);
    setLog([
      `${pet.name} went to ${location.area}.`,
      `Time limit: ${location.durationMinutes} seconds in prototype mode.`,
      "In Supabase version, this will save start and return time.",
    ]);
  }

  function startRandomExploration() {
    startExploration(getRandomExploration(Date.now()));
  }

  function completeExploration() {
    setActive(false);
    setCompleted(true);
    setRemainingMinutes(0);
    setLog((current) => [
      selectedLocation.discovery,
      `${pet.name} brought back +${adjustedXp} XP, +${adjustedCoins} Star Coins, ${selectedLocation.careBonus}. Mood and Bond added a small bonus.`,
      ...current,
    ]);
  }

  const petImage = active
    ? getPetEmotionImageUrl(pet, "focused")
    : completed
      ? getPetEmotionImageUrl(pet, "proud")
      : currentEmotion.imageUrl;

  return (
    <div className="mx-auto grid max-w-6xl gap-5 xl:grid-cols-[430px_1fr]">
      <section className="relative mx-auto w-full max-w-[430px] overflow-hidden rounded-[2.2rem] border border-white/20 bg-[#08256F]/85 p-4 shadow-[0_24px_80px_rgba(0,0,0,0.25)] backdrop-blur">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_24%_18%,rgba(255,255,255,0.22)_0_1px,transparent_2px),radial-gradient(circle_at_72%_30%,rgba(255,255,255,0.16)_0_1px,transparent_2px),radial-gradient(circle_at_42%_72%,rgba(255,255,255,0.12)_0_1px,transparent_2px)]" />

        <div className="relative z-10 flex items-center justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#FFCF17]">
              Tawau adventure
            </p>
            <h1 className="mt-1 text-3xl font-black">Pet Explore</h1>
          </div>
          <Link
            href="/student"
            className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-xs font-black text-white"
          >
            Home
          </Link>
        </div>

        <div className="relative z-10 mt-4 rounded-[2rem] border border-white/15 bg-gradient-to-b from-[#12389B] to-[#09256B] p-4 text-center shadow-[0_20px_48px_rgba(0,0,0,0.28)]">
          <div className="absolute inset-x-8 bottom-16 h-16 rounded-full bg-[#4FB8FF]/25 blur-2xl" />
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#FFCF17]">
            Explorer pet
          </p>
          <h2 className="mt-1 text-2xl font-black">{pet.name}</h2>
          <p className="mt-1 text-sm font-bold text-white/65">
            {active ? "Focused on route" : completed ? "Returned proudly" : currentEmotion.message}
          </p>
          <div className="relative mx-auto mt-4 h-72 w-72 max-w-full">
            <div className="absolute inset-x-8 bottom-3 h-10 rounded-full bg-black/25 blur-xl" />
            <Image
              src={petImage}
              alt={pet.name}
              width={360}
              height={360}
              className="pet-bounce relative z-10 h-full w-full rounded-[2.2rem] object-cover drop-shadow-[0_22px_32px_rgba(0,0,0,0.35)]"
              priority
            />
          </div>
        </div>

        <div className="relative z-10 mt-4 rounded-[1.8rem] border border-white/15 bg-gradient-to-br from-[#153DB5] via-[#4D20AA] to-[#102A8E] p-4 shadow-[0_18px_42px_rgba(0,0,0,0.25)]">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-white/55">
            Selected route
          </p>
          <h2 className="mt-1 text-2xl font-black text-white">{selectedLocation.name}</h2>
          <p className="mt-2 text-sm font-bold text-white/65">
            +{adjustedXp} XP · +{adjustedCoins} coins · {selectedLocation.careBonus}
          </p>
          <div className="mt-4">
            <div className="mb-2 flex justify-between text-xs font-black text-white/60">
              <span>{active ? "Exploring timer" : completed ? "Returned" : "Ready"}</span>
              <span>{active ? `${remainingMinutes}s left` : `${selectedLocation.durationMinutes}s`}</span>
            </div>
            <ProgressRail value={timerProgress} />
          </div>
        </div>

        <div className="relative z-10 mt-4 grid grid-cols-3 gap-2">
          {[
            ["Mood", `${Math.round(care.mood)}%`, "text-[#FFCF17]"],
            ["Energy", `${Math.round(care.energy)}%`, "text-[#39D353]"],
            ["Bond", `${Math.round(care.bond)}%`, "text-[#4FB8FF]"],
          ].map(([label, value, tone]) => (
            <div key={label} className="rounded-3xl border border-white/15 bg-white/10 px-3 py-3 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.22)]">
              <p className={`text-lg font-black ${tone}`}>{value}</p>
              <p className="mt-1 text-[0.62rem] font-black uppercase tracking-[0.12em] text-white/55">
                {label}
              </p>
            </div>
          ))}
        </div>

        <div className="relative z-10 mt-4 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => startExploration()}
            className="rounded-2xl bg-gradient-to-r from-[#8B38FF] to-[#4FB8FF] px-5 py-4 text-sm font-black text-white shadow-[0_14px_30px_rgba(79,184,255,0.25)] transition hover:-translate-y-0.5"
          >
            Start Route
          </button>
          <button
            type="button"
            onClick={startRandomExploration}
            className="rounded-2xl bg-[#FFCF17] px-5 py-4 text-sm font-black text-[#102A54] shadow-[0_12px_24px_rgba(255,207,23,0.22)] transition hover:-translate-y-0.5"
          >
            Random Trip
          </button>
        </div>

        {active ? (
          <button
            type="button"
            onClick={completeExploration}
            disabled={remainingMinutes > 0}
            className="relative z-10 mt-3 w-full rounded-2xl bg-[#39D353] px-5 py-4 text-sm font-black text-[#05245F] shadow-[0_12px_24px_rgba(57,211,83,0.2)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:bg-white/15 disabled:text-white/55"
          >
            {remainingMinutes > 0 ? "Exploring..." : "Claim Return Reward"}
          </button>
        ) : null}
      </section>

      <section className="grid content-start gap-4">
        <div className="rounded-[2rem] border border-white/15 bg-white/10 p-4 shadow-[0_18px_52px_rgba(0,0,0,0.2)] backdrop-blur">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#FFCF17]">
                Adventure log
              </p>
              <h2 className="mt-1 text-2xl font-black">
                {active ? "Exploring now" : completed ? "Returned safely" : "Choose a route"}
              </h2>
            </div>
            <span className="rounded-2xl bg-[#39D353] px-4 py-2 text-sm font-black text-[#05245F]">
              {selectedLocation.careBonus}
            </span>
          </div>
          <div className="mt-4 grid gap-3">
            {log.slice(0, 4).map((message, index) => (
              <p
                key={`${message}-${index}`}
                className="rounded-2xl border border-white/12 bg-[#071E63]/70 p-4 text-sm font-bold leading-6 text-white/75"
              >
                {message}
              </p>
            ))}
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {tawauExplorationLocations.map((location) => (
            <LocationCard
              key={location.id}
              location={location}
              selected={location.id === selectedId}
              onSelect={() => {
                setSelectedId(location.id);
                setCompleted(false);
                setActive(false);
              }}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
