"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  drawBlindBox,
  getLimitedPetCollection,
  getRandomBlindBoxShelf,
  type BlindBox,
} from "@/lib/blind-boxes";
import type { PetCard } from "@/lib/types";

const initialShelfSeed = 5312026;

function ProgressRail({ value }: { value: number }) {
  return (
    <div className="h-3 overflow-hidden rounded-full bg-[#082057] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.18)]">
      <div
        className="h-full rounded-full bg-gradient-to-r from-[#FFEF82] via-[#FFC107] to-[#8B38FF] shadow-[0_0_18px_rgba(255,193,7,0.55)]"
        style={{ width: `${Math.max(4, Math.min(100, value))}%` }}
      />
    </div>
  );
}

function boxAccent(box: BlindBox) {
  if (box.tier === "rare") return "from-[#FFCF17] via-[#FF6B57] to-[#8B38FF]";
  if (box.tier === "star") return "from-[#4FB8FF] via-[#8B38FF] to-[#39D353]";
  return "from-[#FFCF17] via-[#FF9F1C] to-[#4FB8FF]";
}

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
    <div className="mx-auto grid max-w-6xl gap-5 xl:grid-cols-[430px_1fr]">
      <section className="relative mx-auto w-full max-w-[430px] overflow-hidden rounded-[2.2rem] border border-white/20 bg-[#08256F]/85 p-4 shadow-[0_24px_80px_rgba(0,0,0,0.25)] backdrop-blur">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_24%_18%,rgba(255,255,255,0.22)_0_1px,transparent_2px),radial-gradient(circle_at_72%_30%,rgba(255,255,255,0.16)_0_1px,transparent_2px),radial-gradient(circle_at_42%_72%,rgba(255,255,255,0.12)_0_1px,transparent_2px)]" />

        <div className="relative z-10 flex items-center justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#FFCF17]">
              Star box shop
            </p>
            <h1 className="mt-1 text-3xl font-black">Blind Boxes</h1>
          </div>
          <Link
            href="/student"
            className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-xs font-black text-white"
          >
            Home
          </Link>
        </div>

        <div className="relative z-10 mt-4 rounded-[1.8rem] border border-white/15 bg-gradient-to-br from-[#153DB5] via-[#4D20AA] to-[#102A8E] p-4 shadow-[0_18px_42px_rgba(0,0,0,0.25)]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-white/55">
                Wallet
              </p>
              <div className="mt-1 flex items-center gap-2">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-[#FFCF17] text-lg font-black text-[#102A54] shadow-[0_0_22px_rgba(255,207,23,0.45)]">
                  S
                </span>
                <p className="text-3xl font-black text-white">{coins}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={refreshShelf}
              className="rounded-2xl bg-[#FFCF17] px-4 py-3 text-xs font-black text-[#102A54] shadow-[0_12px_24px_rgba(255,207,23,0.22)]"
            >
              Refresh
            </button>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2">
            {[
              ["Normal", tickets.normal],
              ["Star", tickets.star],
              ["Rare", tickets.rare],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-white/15 bg-white/10 px-3 py-2 text-center">
                <p className="text-lg font-black">{value}</p>
                <p className="text-[0.62rem] font-black uppercase tracking-wide text-white/55">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 mt-4 rounded-[2rem] border border-white/15 bg-[#09256B]/75 p-4 text-center shadow-[0_20px_48px_rgba(0,0,0,0.28)]">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#FFCF17]">
            Selected box
          </p>
          <div className={`relative mx-auto mt-4 h-56 w-56 overflow-hidden rounded-[2.2rem] bg-gradient-to-br ${boxAccent(selectedBox)} p-3 shadow-[0_0_36px_rgba(79,184,255,0.26)]`}>
            <Image
              src={selectedBox.imageUrl}
              alt={selectedBox.name}
              width={320}
              height={320}
              className="h-full w-full rounded-[1.7rem] object-cover"
              priority
            />
          </div>
          <h2 className="mt-4 text-3xl font-black">{selectedBox.name}</h2>
          <p className="mt-1 text-sm font-bold text-white/65">
            {selectedBox.appearanceRate} · {selectedBox.rarityHint}
          </p>
          <div className="mt-4">
            <div className="mb-2 flex justify-between text-xs font-black text-white/60">
              <span>Lucky energy</span>
              <span>{selectedBox.tier === "rare" ? "1/10000" : selectedBox.tier === "star" ? "8.5%" : "common"}</span>
            </div>
            <ProgressRail value={selectedBox.tier === "rare" ? 8 : selectedBox.tier === "star" ? 48 : 78} />
          </div>
          <button
            type="button"
            onClick={() => openBox(selectedBox)}
            disabled={selectedBox.tier === "rare" && tickets.rare <= 0}
            className="mt-5 w-full rounded-2xl bg-gradient-to-r from-[#8B38FF] to-[#4FB8FF] px-5 py-4 text-sm font-black text-white shadow-[0_14px_30px_rgba(79,184,255,0.25)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:from-white/20 disabled:to-white/10 disabled:text-white/55"
          >
            {selectedBox.tier === "rare" && tickets.rare <= 0
              ? "Need Rare Chance Ticket"
              : `Open for ${selectedBox.costCoins} coins`}
          </button>
        </div>
      </section>

      <section className="grid content-start gap-4">
        <div className="rounded-[2rem] border border-white/15 bg-white/10 p-4 shadow-[0_18px_52px_rgba(0,0,0,0.2)] backdrop-blur">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#FFCF17]">
                Today&apos;s shelf
              </p>
              <h2 className="mt-1 text-2xl font-black">Random boxes appeared</h2>
            </div>
            <span className="rounded-2xl bg-[#39D353] px-4 py-2 text-sm font-black text-[#05245F]">
              3 slots
            </span>
          </div>
          <p className="mt-2 text-sm font-bold leading-6 text-white/62">
            Normal boxes appear often. Star boxes are uncommon. Rare boxes are a pure luck event and still need a Rare Chance Ticket.
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          {availableBoxes.map((box, index) => (
            <button
              type="button"
              key={`${box.id}-${index}`}
              onClick={() => setSelectedBox(box)}
              className={`rounded-[1.6rem] border border-white/15 bg-gradient-to-br ${boxAccent(box)} p-3 text-left shadow-[0_16px_38px_rgba(0,0,0,0.2)] transition hover:-translate-y-0.5 ${
                selectedBox.id === box.id ? "ring-4 ring-[#FFCF17]/45" : ""
              }`}
            >
              <div className="relative h-28 overflow-hidden rounded-[1.3rem] bg-white/18">
                <Image
                  src={box.imageUrl}
                  alt={box.name}
                  width={200}
                  height={200}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="mt-3 flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-lg font-black text-white">{box.name}</h3>
                  <p className="mt-1 text-xs font-bold text-white/70">
                    Slot {index + 1} · {box.appearanceRate}
                  </p>
                </div>
                <span className="rounded-full bg-white/18 px-3 py-1 text-[0.68rem] font-black text-white">
                  {box.costCoins}
                </span>
              </div>
            </button>
          ))}
        </div>

        {result ? (
          <div className="rounded-[2rem] border border-white/15 bg-white/10 p-4 shadow-[0_18px_52px_rgba(0,0,0,0.18)] backdrop-blur">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#FFCF17]">
              Reward result
            </p>
            {result.rewardType === "limited_pet" ? (
              <div className="mt-4 grid gap-4 sm:grid-cols-[120px_1fr] sm:items-center">
                <div className="relative h-28 w-28 overflow-hidden rounded-[1.5rem] bg-white/15">
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
                  <p className="mt-1 text-sm font-black uppercase text-white/55">
                    Limited #{result.collectionNo}/81
                  </p>
                  <p className="mt-2 text-sm font-bold leading-6 text-white/68">
                    {result.description}
                  </p>
                </div>
              </div>
            ) : (
              <div>
                <h3 className="mt-2 text-2xl font-black">{result.name}</h3>
                <p className="mt-1 text-sm font-black uppercase text-white/55">
                  {result.rarity} · {result.rewardType}
                </p>
                <p className="mt-2 text-sm font-bold leading-6 text-white/68">
                  {result.description}
                </p>
                <p className="mt-3 inline-flex rounded-full bg-[#39D353] px-4 py-2 text-sm font-black text-[#05245F]">
                  +{result.xpAmount} XP · +{result.coinAmount} coins
                </p>
              </div>
            )}
          </div>
        ) : null}

        <div className="rounded-[2rem] border border-white/15 bg-white/10 p-4 shadow-[0_18px_52px_rgba(0,0,0,0.18)] backdrop-blur">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#FFCF17]">
            Rare collection
          </p>
          <h2 className="mt-1 text-2xl font-black">81 limited pet styles</h2>
          <p className="mt-2 text-sm font-bold leading-6 text-white/62">
            9 pet bases x 9 decorations. Rare Box draws limited pet looks only.
          </p>
          <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-6 lg:grid-cols-9">
            {limitedPreview.map((item) => (
              <div
                key={item.collectionNo}
                className="overflow-hidden rounded-2xl border border-white/15 bg-white/10"
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
