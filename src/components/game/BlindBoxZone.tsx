"use client";

import Image from "next/image";
import { useState } from "react";
import {
  drawBlindBox,
  getLimitedPetCollection,
  getRandomBlindBoxShelf,
  type BlindBox,
} from "@/lib/blind-boxes";
import type { PetCard } from "@/lib/types";

const initialShelfSeed = 5312026;

export function BlindBoxZone({ cards, coins }: { cards: PetCard[]; coins: number }) {
  const [shelfSeed, setShelfSeed] = useState(initialShelfSeed);
  const [availableBoxes, setAvailableBoxes] = useState<BlindBox[]>(() =>
    getRandomBlindBoxShelf(initialShelfSeed),
  );
  const [selectedBox, setSelectedBox] = useState<BlindBox>(availableBoxes[0]);
  const [result, setResult] = useState<ReturnType<typeof drawBlindBox> | null>(null);
  const limitedPreview = getLimitedPetCollection().slice(0, 9);
  const tickets = {
    normal: 2,
    star: 1,
    rare: 0,
  };

  function openBox(box: BlindBox) {
    if (box.tier === "rare" && tickets.rare <= 0) {
      setResult(null);
      return;
    }

    setSelectedBox(box);
    setResult(drawBlindBox(box.id, cards));
  }

  function refreshShelf() {
    const nextSeed = Date.now() + shelfSeed;
    const nextShelf = getRandomBlindBoxShelf(nextSeed);
    setShelfSeed(nextSeed);
    setAvailableBoxes(nextShelf);
    setSelectedBox(nextShelf[0]);
    setResult(null);
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
      <section className="rounded-[2rem] border-4 border-[#102A54] bg-[#FFFEF8] p-5 shadow-[8px_8px_0_rgba(16,42,84,0.12)]">
        <p className="inline-flex rounded-full border-2 border-[#102A54] bg-[#FFD95A] px-3 py-1 text-xs font-black uppercase tracking-[0.16em]">
          Blind box zone
        </p>
        <h1 className="mt-3 text-4xl font-black">Today&apos;s random boxes</h1>
        <p className="mt-2 text-sm font-bold leading-6 text-[#102A54]/65">
          Three boxes appear by luck. Normal is common, Star is uncommon, Rare is ultra rare.
        </p>

        <div className="mt-5 rounded-2xl border-2 border-[#102A54] bg-[#FFF7E2] p-4">
          <p className="text-xs font-black uppercase tracking-wide text-[#102A54]/60">
            Balance and tickets
          </p>
          <p className="mt-1 text-3xl font-black">{coins} Star Coins</p>
          <div className="mt-3 grid grid-cols-3 gap-2">
            <span className="rounded-2xl border-2 border-[#102A54] bg-[#FFFEF8] px-3 py-2 text-center text-xs font-black">
              {tickets.normal} Normal
            </span>
            <span className="rounded-2xl border-2 border-[#102A54] bg-[#FFFEF8] px-3 py-2 text-center text-xs font-black">
              {tickets.star} Star
            </span>
            <span className="rounded-2xl border-2 border-[#102A54] bg-[#FFFEF8] px-3 py-2 text-center text-xs font-black">
              {tickets.rare} Rare
            </span>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between gap-3 rounded-2xl border-2 border-[#102A54] bg-[#FFF7E2] p-4">
          <div>
            <p className="text-xs font-black uppercase tracking-wide text-[#102A54]/60">
              Appearance chance
            </p>
            <p className="mt-1 text-sm font-bold text-[#102A54]/70">
              Normal high · Star low · Rare about 1 / 10,000 per slot
            </p>
          </div>
          <button
            type="button"
            onClick={refreshShelf}
            className="shrink-0 rounded-2xl border-2 border-[#102A54] bg-[#FFD95A] px-4 py-3 text-xs font-black shadow-[3px_3px_0_#102A54] transition hover:-translate-y-0.5"
          >
            Refresh Mock
          </button>
        </div>

        <div className="mt-5 grid gap-3">
          {availableBoxes.map((box, index) => (
            <button
              type="button"
              key={`${box.id}-${index}`}
              onClick={() => setSelectedBox(box)}
              className={`rounded-[1.5rem] border-2 border-[#102A54] bg-gradient-to-br ${box.colorClass} p-4 text-left shadow-[4px_4px_0_rgba(16,42,84,0.14)] transition hover:-translate-y-0.5 ${
                selectedBox.id === box.id ? "ring-4 ring-[#102A54]/15" : ""
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border-2 border-[#102A54] bg-[#FFFEF8] shadow-[3px_3px_0_rgba(16,42,84,0.16)]">
                  <Image
                    src={box.imageUrl}
                    alt={box.name}
                    width={160}
                    height={160}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl font-black">{box.name}</h2>
                    <span className="rounded-full border-2 border-[#102A54] bg-[#FFFEF8] px-3 py-1 text-xs font-black">
                      {box.costCoins} coins
                    </span>
                  </div>
                  <p className="mt-1 text-sm font-bold text-[#102A54]/65">
                    Slot {index + 1} · {box.appearanceRate}
                  </p>
                  <p className="mt-3 text-sm font-bold leading-5 text-[#102A54]/70">
                    {box.theme} · {box.rarityHint}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-[2rem] border-4 border-[#102A54] bg-gradient-to-br from-[#FFF7E2] to-[#7BE0C3]/40 p-5 shadow-[8px_8px_0_rgba(16,42,84,0.16)]">
        <div className="rounded-[2rem] border-4 border-[#102A54] bg-[#FFFEF8] p-5 text-center shadow-[6px_6px_0_rgba(16,42,84,0.16)]">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#FF6B57]">
            Selected box
          </p>
          <div className={`relative mx-auto mt-5 h-48 w-48 overflow-hidden rounded-[2.5rem] border-4 border-[#102A54] bg-gradient-to-br ${selectedBox.colorClass} shadow-[8px_8px_0_rgba(16,42,84,0.18)]`}>
            <Image
              src={selectedBox.imageUrl}
              alt={selectedBox.name}
              width={320}
              height={320}
              className="h-full w-full object-cover"
              priority
            />
          </div>
          <h2 className="mt-5 text-3xl font-black">{selectedBox.name}</h2>
          <p className="mt-2 text-sm font-bold text-[#102A54]/65">
            {selectedBox.appearanceRate} · {selectedBox.rarityHint}
          </p>
          <button
            type="button"
            onClick={() => openBox(selectedBox)}
            disabled={selectedBox.tier === "rare" && tickets.rare <= 0}
            className="mt-5 w-full rounded-2xl border-2 border-[#102A54] bg-[#FFD95A] px-5 py-4 text-sm font-black shadow-[4px_4px_0_#102A54] transition hover:-translate-y-0.5"
          >
            {selectedBox.tier === "rare" && tickets.rare <= 0
              ? "Need Rare Chance Ticket"
              : "Open Box"}
          </button>
          {selectedBox.tier === "rare" ? (
            <p className="mt-3 rounded-2xl border-2 border-[#102A54]/20 bg-[#FFF7E2] p-3 text-xs font-bold leading-5 text-[#102A54]/70">
              Rare Box cannot be opened with coins only. Earn Rare Chance Tickets from weekly streaks, teacher rewards, or special events.
            </p>
          ) : null}
        </div>

        {result ? (
          <div className="mt-5 rounded-[1.5rem] border-2 border-[#102A54] bg-[#FFFEF8] p-4">
            <p className="text-xs font-black uppercase tracking-wide text-[#FF6B57]">
              You received
            </p>
            {result.rewardType === "limited_pet" ? (
              <div className="mt-3 flex gap-4 rounded-[1.5rem] border-2 border-[#102A54]/20 bg-[#FFF7E2] p-3">
                <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl border-2 border-[#102A54] bg-[#FFFEF8]">
                  <Image
                    src={result.imageUrl}
                    alt={result.name}
                    width={180}
                    height={180}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="text-2xl font-black">{result.name}</h3>
                  <p className="mt-1 text-sm font-black uppercase text-[#102A54]/60">
                    Limited #{result.collectionNo}/81
                  </p>
                </div>
              </div>
            ) : (
              <>
                <h3 className="mt-2 text-2xl font-black">{result.name}</h3>
                <p className="mt-1 text-sm font-black uppercase text-[#102A54]/60">
                  {result.rarity} · {result.rewardType}
                </p>
              </>
            )}
            <p className="mt-3 text-sm font-bold leading-6 text-[#102A54]/70">
              {result.description}
            </p>
            {result.rewardType !== "limited_pet" ? (
              <p className="mt-3 inline-flex rounded-full border-2 border-[#102A54] bg-[#7BE0C3] px-3 py-2 text-sm font-black">
                +{result.xpAmount} XP · +{result.coinAmount} coins
              </p>
            ) : null}
          </div>
        ) : null}

        <div className="mt-5 rounded-[1.5rem] border-2 border-[#102A54] bg-[#FFFEF8] p-4">
          <p className="text-xs font-black uppercase tracking-wide text-[#FF6B57]">
            Rare collection preview
          </p>
          <h3 className="mt-2 text-2xl font-black">81 limited pet styles</h3>
          <p className="mt-2 text-sm font-bold leading-6 text-[#102A54]/65">
            9 pet bases x 9 decorations. Rare Box draws limited pet looks only.
          </p>
          <div className="mt-4 grid grid-cols-3 gap-2">
            {limitedPreview.map((item) => (
              <div
                key={item.collectionNo}
                className="overflow-hidden rounded-2xl border-2 border-[#102A54] bg-[#FFF7E2]"
              >
                <Image
                  src={item.imageUrl}
                  alt={`${item.petBase} ${item.decoration}`}
                  width={120}
                  height={120}
                  className="aspect-square w-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
