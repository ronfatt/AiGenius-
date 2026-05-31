"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { getCurrentPetEmotion } from "@/lib/pet-emotions";
import type { BattleMode, BattleQuestion, Pet } from "@/lib/types";

type BattleArenaProps = {
  pet: Pet;
  questions: BattleQuestion[];
  classCompletionRate: number;
};

type BattleModeOption = {
  mode: BattleMode;
  label: string;
  enemyName: string;
  enemyImageUrl: string;
  enemyMaxHp: number;
  rewardXp: number;
  rewardCoins: number;
};

const modes: BattleModeOption[] = [
  {
    mode: "solo",
    label: "Solo Training",
    enemyName: "Training Bot",
    enemyImageUrl: "/pets/boss01.png",
    enemyMaxHp: 90,
    rewardXp: 35,
    rewardCoins: 8,
  },
  {
    mode: "class_boss",
    label: "Class Boss",
    enemyName: "Homework Boss",
    enemyImageUrl: "/pets/boss03.png",
    enemyMaxHp: 180,
    rewardXp: 80,
    rewardCoins: 22,
  },
  {
    mode: "student_vs_student",
    label: "Mock Battle",
    enemyName: "Rival Pet",
    enemyImageUrl: "/pets/boss05.png",
    enemyMaxHp: 120,
    rewardXp: 50,
    rewardCoins: 14,
  },
];

const bossImages = [
  "/pets/boss01.png",
  "/pets/boss02.png",
  "/pets/boss03.png",
  "/pets/boss04.png",
  "/pets/boss05.png",
];

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function HpBar({ hp, maxHp, tone }: { hp: number; maxHp: number; tone: "pet" | "enemy" }) {
  const percent = clamp(Math.round((hp / maxHp) * 100), 0, 100);
  const color = tone === "pet" ? "from-[#4FB8FF] to-[#39D353]" : "from-[#FFCF17] to-[#FF6B57]";

  return (
    <div>
      <div className="mb-2 flex justify-between text-xs font-black text-white/62">
        <span>{tone === "pet" ? "Pet HP" : "Enemy HP"}</span>
        <span>{hp} / {maxHp}</span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-[#082057] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.18)]">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${color}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

export function BattleArena({ pet, questions, classCompletionRate }: BattleArenaProps) {
  const [mode, setMode] = useState<BattleMode>("solo");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [playerHp, setPlayerHp] = useState(120);
  const [enemyHp, setEnemyHp] = useState(90);
  const [battleLog, setBattleLog] = useState<string[]>([
    "Battle started. Read the English question and choose one answer.",
  ]);
  const [correctCount, setCorrectCount] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [bossImageIndex, setBossImageIndex] = useState(0);

  const selectedMode = useMemo(() => modes.find((item) => item.mode === mode) ?? modes[0], [mode]);
  const question = questions[questionIndex % questions.length];
  const enemyImageUrl = bossImages[bossImageIndex] ?? selectedMode.enemyImageUrl;
  const petEmotion = getCurrentPetEmotion(pet);
  const playerMaxHp = 120;
  const adjustedEnemyMaxHp =
    selectedMode.mode === "class_boss"
      ? Math.max(70, selectedMode.enemyMaxHp - Math.round(selectedMode.enemyMaxHp * classCompletionRate))
      : selectedMode.enemyMaxHp;

  function resetBattle(nextMode = mode) {
    const nextModeConfig = modes.find((item) => item.mode === nextMode) ?? modes[0];
    const nextEnemyHp =
      nextModeConfig.mode === "class_boss"
        ? Math.max(70, nextModeConfig.enemyMaxHp - Math.round(nextModeConfig.enemyMaxHp * classCompletionRate))
        : nextModeConfig.enemyMaxHp;

    setMode(nextMode);
    setBossImageIndex(Math.max(0, modes.findIndex((item) => item.mode === nextMode) * 2));
    setQuestionIndex(0);
    setPlayerHp(playerMaxHp);
    setEnemyHp(nextEnemyHp);
    setBattleLog([
      `${nextModeConfig.label} started.`,
      "Correct answers attack. Wrong answers miss and may trigger a counter.",
    ]);
    setCorrectCount(0);
    setShowResult(false);
  }

  function rotateBossImage() {
    setBossImageIndex((current) => (current + 1) % bossImages.length);
    setBattleLog((current) => ["A new boss appeared. Rules stay the same.", ...current].slice(0, 6));
  }

  function handleAnswer(answer: string) {
    if (showResult) return;

    const isCorrect = answer === question.answer;
    const attributeBonus = Math.min(8, Math.round((pet.power + pet.wisdom + pet.focus) / 45));
    const baseDamage = selectedMode.mode === "class_boss" ? 24 : 30;
    const damage = isCorrect ? baseDamage + attributeBonus : 0;
    const enemyCounter = selectedMode.mode === "solo" ? 10 : 14;
    const nextEnemyHp = clamp(enemyHp - damage, 0, adjustedEnemyMaxHp);
    const nextPlayerHp = isCorrect ? playerHp : clamp(playerHp - enemyCounter, 0, playerMaxHp);

    setBattleLog((current) => [
      isCorrect
        ? `Correct: ${pet.name} used ${question.skillTag} and dealt ${damage} damage.`
        : `Wrong: ${pet.name}'s attack missed.`,
      isCorrect
        ? `${selectedMode.enemyName} HP dropped to ${nextEnemyHp}.`
        : `${selectedMode.enemyName} countered for ${enemyCounter} damage. ${pet.name} HP is now ${nextPlayerHp}.`,
      ...current,
    ].slice(0, 6));
    setEnemyHp(nextEnemyHp);
    setPlayerHp(nextPlayerHp);
    setCorrectCount((count) => count + (isCorrect ? 1 : 0));

    if (nextEnemyHp <= 0 || nextPlayerHp <= 0 || questionIndex + 1 >= questions.length) {
      setShowResult(true);
      return;
    }

    setQuestionIndex((index) => index + 1);
  }

  const won = enemyHp <= 0 || (questionIndex + 1 >= questions.length && enemyHp < playerHp);
  const rewardXp = won ? selectedMode.rewardXp : Math.round(selectedMode.rewardXp * 0.35);
  const rewardCoins = won ? selectedMode.rewardCoins : Math.round(selectedMode.rewardCoins * 0.35);

  return (
    <section className="mx-auto grid max-w-6xl gap-5 xl:grid-cols-[430px_1fr]">
      <aside className="relative mx-auto w-full max-w-[430px] overflow-hidden rounded-[2.2rem] border border-white/20 bg-[#08256F]/85 p-4 shadow-[0_24px_80px_rgba(0,0,0,0.25)] backdrop-blur">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#FFCF17]">
              Quiz battle
            </p>
            <h1 className="mt-1 text-3xl font-black">Battle Arena</h1>
          </div>
          <Link href="/student" className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-xs font-black">
            Home
          </Link>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          {modes.map((item) => (
            <button
              type="button"
              key={item.mode}
              onClick={() => resetBattle(item.mode)}
              className={`rounded-2xl px-3 py-3 text-xs font-black ${
                item.mode === mode ? "bg-[#FFCF17] text-[#102A54]" : "bg-white/10 text-white"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-[1.8rem] border border-white/15 bg-gradient-to-b from-[#12389B] to-[#09256B] p-3 text-center">
            <div className="relative mx-auto h-32 w-32 overflow-hidden rounded-[1.6rem]">
              <Image src={petEmotion.imageUrl} alt={pet.name} width={220} height={220} className="h-full w-full object-cover" priority />
            </div>
            <h2 className="mt-3 text-lg font-black">{pet.name}</h2>
            <p className="text-xs font-bold text-white/55">Lv {pet.level}</p>
            <div className="mt-3">
              <HpBar hp={playerHp} maxHp={playerMaxHp} tone="pet" />
            </div>
          </div>

          <div className="rounded-[1.8rem] border border-white/15 bg-gradient-to-b from-[#4D20AA] to-[#09256B] p-3 text-center">
            <div className="relative mx-auto h-32 w-32 overflow-hidden rounded-[1.6rem]">
              <Image src={enemyImageUrl} alt={selectedMode.enemyName} width={220} height={220} className="h-full w-full object-cover" priority />
            </div>
            <h2 className="mt-3 text-lg font-black">{selectedMode.enemyName}</h2>
            <button type="button" onClick={rotateBossImage} className="mt-1 text-xs font-black text-[#FFCF17]">
              Change boss
            </button>
            <div className="mt-3">
              <HpBar hp={enemyHp} maxHp={adjustedEnemyMaxHp} tone="enemy" />
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-[1.8rem] border border-white/15 bg-gradient-to-br from-[#153DB5] via-[#4D20AA] to-[#102A8E] p-4">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-white/55">
            Reward
          </p>
          <p className="mt-1 text-2xl font-black">+{selectedMode.rewardXp} XP · +{selectedMode.rewardCoins} coins</p>
          <p className="mt-2 text-sm font-bold text-white/62">
            Pet stats add only a small bonus. Correct answers matter most.
          </p>
        </div>
      </aside>

      <section className="grid content-start gap-4">
        <div className="rounded-[2rem] border border-white/15 bg-white/10 p-4 shadow-[0_18px_52px_rgba(0,0,0,0.2)] backdrop-blur">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#FFCF17]">
                Question {questionIndex + 1} / {questions.length}
              </p>
              <h2 className="mt-2 text-2xl font-black">{question.prompt}</h2>
            </div>
            <span className="rounded-2xl bg-[#39D353] px-4 py-2 text-sm font-black text-[#05245F]">
              {question.subject}
            </span>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {question.options.map((option) => (
              <button
                type="button"
                key={option}
                onClick={() => handleAnswer(option)}
                className="rounded-2xl bg-[#071E63]/70 px-4 py-4 text-left text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-[#FFCF17] hover:text-[#102A54]"
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/15 bg-white/10 p-4 shadow-[0_18px_52px_rgba(0,0,0,0.18)] backdrop-blur">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#FFCF17]">
            Battle log
          </p>
          <div className="mt-4 grid gap-3">
            {battleLog.map((message, index) => (
              <p
                key={`${message}-${index}`}
                className="rounded-2xl border border-white/12 bg-[#071E63]/70 p-4 text-sm font-bold leading-6 text-white/75"
              >
                {message}
              </p>
            ))}
          </div>
          {selectedMode.mode === "class_boss" ? (
            <p className="mt-3 text-xs font-bold text-[#FFCF17]">
              Class task completion reduced boss HP by {Math.round(classCompletionRate * 100)}%.
            </p>
          ) : null}
        </div>
      </section>

      {showResult ? (
        <div className="fixed inset-0 z-40 grid place-items-center bg-[#071E63]/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[2rem] border border-white/20 bg-[#08256F] p-6 text-white shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#FFCF17]">
              Battle result
            </p>
            <h3 className="mt-2 text-3xl font-black">{won ? "Victory" : "Training complete"}</h3>
            <p className="mt-3 text-sm font-bold leading-6 text-white/68">
              Correct answers: {correctCount} / {questions.length}. You earned {rewardXp} XP and {rewardCoins} Star Coins.
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => resetBattle(mode)}
                className="rounded-2xl bg-gradient-to-r from-[#8B38FF] to-[#4FB8FF] px-4 py-3 text-sm font-black"
              >
                Battle again
              </button>
              <button
                type="button"
                onClick={() => setShowResult(false)}
                className="rounded-2xl bg-white/10 px-4 py-3 text-sm font-black"
              >
                View arena
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
