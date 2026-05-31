"use client";

import { useEffect, useMemo, useState } from "react";
import {
  getPetCareState,
  getRandomExploration,
  tawauExplorationLocations,
  type ExplorationLocation,
} from "@/lib/exploration";
import type { Pet } from "@/lib/types";
import { PetAvatar } from "./PetAvatar";

function LocationCard({
  location,
  selected,
  onSelect,
}: {
  location: ExplorationLocation;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`rounded-[1.5rem] border-2 border-[#102A54] p-4 text-left transition hover:-translate-y-0.5 ${
        selected
          ? "bg-[#FFD95A] shadow-[4px_4px_0_#102A54]"
          : "bg-[#FFFEF8] shadow-[4px_4px_0_rgba(16,42,84,0.12)]"
      }`}
    >
      <p className="text-xs font-black uppercase tracking-wide text-[#FF6B57]">
        {location.area}
      </p>
      <h3 className="mt-2 text-lg font-black">{location.name}</h3>
      <p className="mt-2 text-sm font-bold text-[#102A54]/60">
        {location.durationMinutes} min · {location.difficulty}
      </p>
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
      `Time limit: ${location.durationMinutes} minutes.`,
      "Adventure is running in mock mode. In Supabase version, this will save start and end time.",
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

  return (
    <div className="grid gap-5 xl:grid-cols-[0.85fr_1.15fr]">
      <section className="rounded-[2rem] border-4 border-[#102A54] bg-gradient-to-br from-[#4FB8FF] via-[#7BE0C3] to-[#FFD95A] p-5 shadow-[8px_8px_0_rgba(16,42,84,0.16)]">
        <p className="inline-flex rounded-full border-2 border-[#102A54] bg-[#FFF7E2] px-3 py-1 text-xs font-black uppercase tracking-[0.16em]">
          Tawau exploration
        </p>
        <h1 className="mt-3 text-4xl font-black">Send pet out</h1>
        <p className="mt-2 text-sm font-bold leading-6 text-[#102A54]/70">
          A calmer growth mode for students who prefer collecting, discovery,
          and pet care over battles.
        </p>

        <div className="mt-6 flex justify-center">
          <PetAvatar imageUrl={pet.imageUrl} name={pet.name} size="lg" animated={false} />
        </div>

        <div className="mt-5 rounded-[1.5rem] border-2 border-[#102A54] bg-[#FFFEF8] p-4">
          <p className="text-xs font-black uppercase tracking-wide text-[#102A54]/60">
            Selected route
          </p>
          <h2 className="mt-2 text-2xl font-black">{selectedLocation.name}</h2>
          <p className="mt-2 text-sm font-bold text-[#102A54]/65">
            {selectedLocation.durationMinutes} minutes · reward +{adjustedXp} XP · +{adjustedCoins} coins
          </p>
          <div className="mt-4 rounded-2xl border-2 border-[#102A54]/20 bg-[#FFF7E2] p-3">
            <div className="flex items-center justify-between text-xs font-black uppercase tracking-wide text-[#102A54]/60">
              <span>{active ? "Exploring timer" : "Timer"}</span>
              <span>{active ? `${remainingMinutes} sec left` : "Not started"}</span>
            </div>
            <div className="mt-2 h-3 overflow-hidden rounded-full border-2 border-[#102A54] bg-[#FFFEF8]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#7BE0C3] to-[#4FB8FF]"
                style={{
                  width: active
                    ? `${Math.max(8, (remainingMinutes / selectedLocation.durationMinutes) * 100)}%`
                    : "0%",
                }}
              />
            </div>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => startExploration()}
            className="rounded-2xl border-2 border-[#102A54] bg-[#FFD95A] px-5 py-4 text-sm font-black shadow-[4px_4px_0_#102A54] transition hover:-translate-y-0.5"
          >
            Start Selected
          </button>
          <button
            type="button"
            onClick={startRandomExploration}
            className="rounded-2xl border-2 border-[#102A54] bg-[#FFB199] px-5 py-4 text-sm font-black shadow-[4px_4px_0_#102A54] transition hover:-translate-y-0.5"
          >
            Random Limited Trip
          </button>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          <div className="rounded-2xl border-2 border-[#102A54] bg-[#FFFEF8] p-3 text-center">
            <p className="text-lg font-black">{Math.round(care.mood)}%</p>
            <p className="text-[0.65rem] font-black uppercase text-[#102A54]/60">Mood bonus</p>
          </div>
          <div className="rounded-2xl border-2 border-[#102A54] bg-[#FFFEF8] p-3 text-center">
            <p className="text-lg font-black">{Math.round(care.energy)}%</p>
            <p className="text-[0.65rem] font-black uppercase text-[#102A54]/60">Energy gate</p>
          </div>
          <div className="rounded-2xl border-2 border-[#102A54] bg-[#FFFEF8] p-3 text-center">
            <p className="text-lg font-black">{Math.round(care.bond)}%</p>
            <p className="text-[0.65rem] font-black uppercase text-[#102A54]/60">Bond bonus</p>
          </div>
        </div>

        {active ? (
          <button
            type="button"
            onClick={completeExploration}
            disabled={remainingMinutes > 0}
            className="mt-3 w-full rounded-2xl border-2 border-[#102A54] bg-[#7BE0C3] px-5 py-4 text-sm font-black shadow-[4px_4px_0_#102A54] transition hover:-translate-y-0.5"
          >
            {remainingMinutes > 0 ? "Exploring..." : "Claim Return Reward"}
          </button>
        ) : null}
      </section>

      <section className="grid gap-4">
        <div className="rounded-[2rem] border-4 border-[#102A54] bg-[#FFFEF8] p-5 shadow-[8px_8px_0_rgba(16,42,84,0.12)]">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#FF6B57]">
                Adventure log
              </p>
              <h2 className="mt-2 text-3xl font-black">
                {active ? "Exploring now" : completed ? "Returned safely" : "Ready to explore"}
              </h2>
            </div>
            <span className="rounded-full border-2 border-[#102A54] bg-[#7BE0C3] px-4 py-2 text-sm font-black">
              {selectedLocation.careBonus}
            </span>
          </div>
          <div className="mt-5 grid gap-3">
            {log.map((message, index) => (
              <p
                key={`${message}-${index}`}
                className="rounded-2xl border-2 border-[#102A54]/15 bg-[#FFF7E2] p-4 text-sm font-bold text-[#102A54]"
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
