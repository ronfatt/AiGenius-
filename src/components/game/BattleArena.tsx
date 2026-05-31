"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { PetAvatar } from "@/components/game/PetAvatar";
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
    label: "Solo Training Battle",
    enemyName: "Training Bot",
    enemyImageUrl: "/pets/boss01.png",
    enemyMaxHp: 90,
    rewardXp: 35,
    rewardCoins: 8,
  },
  {
    mode: "class_boss",
    label: "Class Boss Battle",
    enemyName: "Homework Boss",
    enemyImageUrl: "/pets/boss03.png",
    enemyMaxHp: 180,
    rewardXp: 80,
    rewardCoins: 22,
  },
  {
    mode: "student_vs_student",
    label: "Student vs Student Mock Battle",
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

function HpBar({
  label,
  hp,
  maxHp,
  tone,
}: {
  label: string;
  hp: number;
  maxHp: number;
  tone: "blue" | "red";
}) {
  const percent = clamp(Math.round((hp / maxHp) * 100), 0, 100);
  const color = tone === "blue" ? "bg-[#4FB8FF]" : "bg-[#FF6B57]";

  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-xs font-black uppercase tracking-wide text-[#102A54]/65">
        <span>{label}</span>
        <span>
          {hp} / {maxHp}
        </span>
      </div>
      <div className="h-4 overflow-hidden rounded-full border-2 border-[#102A54] bg-[#EEF2F5]">
        <div className={`progress-fill h-full rounded-full ${color}`} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

export function BattleArena({
  pet,
  questions,
  classCompletionRate,
}: BattleArenaProps) {
  const [mode, setMode] = useState<BattleMode>("solo");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [playerHp, setPlayerHp] = useState(120);
  const [enemyHp, setEnemyHp] = useState(90);
  const [battleLog, setBattleLog] = useState<string[]>([
    "Battle started. Read the question carefully, then choose one answer.",
  ]);
  const [correctCount, setCorrectCount] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [bossImageIndex, setBossImageIndex] = useState(0);

  const selectedMode = useMemo(
    () => modes.find((item) => item.mode === mode) ?? modes[0],
    [mode],
  );
  const question = questions[questionIndex % questions.length];
  const enemyImageUrl = bossImages[bossImageIndex] ?? selectedMode.enemyImageUrl;
  const playerMaxHp = 120;
  const adjustedEnemyMaxHp =
    selectedMode.mode === "class_boss"
      ? Math.max(
          70,
          selectedMode.enemyMaxHp - Math.round(selectedMode.enemyMaxHp * classCompletionRate),
        )
      : selectedMode.enemyMaxHp;

  function resetBattle(nextMode = mode) {
    const nextModeConfig = modes.find((item) => item.mode === nextMode) ?? modes[0];
    const nextEnemyHp =
      nextModeConfig.mode === "class_boss"
        ? Math.max(
            70,
            nextModeConfig.enemyMaxHp -
              Math.round(nextModeConfig.enemyMaxHp * classCompletionRate),
          )
        : nextModeConfig.enemyMaxHp;

    setMode(nextMode);
    setBossImageIndex(modes.findIndex((item) => item.mode === nextMode) * 2);
    setQuestionIndex(0);
    setPlayerHp(playerMaxHp);
    setEnemyHp(nextEnemyHp);
    setBattleLog([
      `${nextModeConfig.label} started.`,
      "Answer correctly to let your pet attack. Wrong answers let the enemy counter.",
    ]);
    setCorrectCount(0);
    setShowResult(false);
  }

  function rotateBossImage() {
    setBossImageIndex((current) => (current + 1) % bossImages.length);
    setBattleLog((current) => [
      "A new boss appeared. The battle rules stay the same.",
      ...current,
    ].slice(0, 6));
  }

  function handleAnswer(answer: string) {
    if (showResult) return;

    const isCorrect = answer === question.answer;
    const attributeBonus = Math.min(8, Math.round((pet.power + pet.wisdom + pet.focus) / 45));
    const baseDamage = selectedMode.mode === "class_boss" ? 24 : 30;
    const damage = isCorrect ? baseDamage + attributeBonus : 0;
    const enemyCounter = selectedMode.mode === "solo" ? 10 : 14;
    const nextEnemyHp = clamp(enemyHp - damage, 0, adjustedEnemyMaxHp);
    const nextPlayerHp = isCorrect
      ? playerHp
      : clamp(playerHp - enemyCounter, 0, playerMaxHp);

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
  const rewardCoins = won
    ? selectedMode.rewardCoins
    : Math.round(selectedMode.rewardCoins * 0.35);

  return (
    <section className="relative overflow-hidden rounded-[2rem] border-4 border-[#102A54] bg-[#FFFEF8] p-4 text-[#102A54] shadow-[8px_8px_0_rgba(16,42,84,0.16)] lg:p-6">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="inline-flex rounded-full border-2 border-[#102A54] bg-[#FFD95A] px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-[#102A54]">
            Quiz Battle
          </p>
          <h2 className="mt-3 text-3xl font-black">Turn-based learning arena</h2>
          <p className="mt-2 max-w-2xl text-sm font-bold leading-6 text-[#102A54]/65">
            Simple text battle: answer English quiz questions, read the battle log,
            and watch HP change. Pet stats give only a small bonus.
          </p>
        </div>
        <div className="grid gap-2 sm:grid-cols-3">
          {modes.map((item) => (
            <button
              type="button"
              key={item.mode}
              onClick={() => resetBattle(item.mode)}
              className={`rounded-2xl px-4 py-3 text-left text-xs font-black transition ${
                item.mode === mode
                  ? "border-2 border-[#102A54] bg-[#FFD95A] text-[#102A54] shadow-[3px_3px_0_#102A54]"
                  : "border-2 border-[#102A54] bg-[#FFF7E2] text-[#102A54] hover:bg-[#7BE0C3]"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-[1.75rem] border-2 border-[#102A54] bg-[#FFF7E2] p-5 text-[#102A54] shadow-[5px_5px_0_rgba(16,42,84,0.12)]">
            <div className="flex justify-center">
              <PetAvatar imageUrl={pet.imageUrl} name={pet.name} size="md" animated={false} />
            </div>
            <h3 className="mt-4 text-2xl font-black">{pet.name}</h3>
            <p className="mt-1 text-sm font-bold text-[#102A54]/60">
              Level {pet.level} · {pet.stage}
            </p>
            <div className="mt-4">
              <HpBar label="Pet HP" hp={playerHp} maxHp={playerMaxHp} tone="blue" />
            </div>
          </div>

          <div className="rounded-[1.75rem] border-2 border-[#102A54] bg-[#FFF7E2] p-5 text-[#102A54] shadow-[5px_5px_0_rgba(16,42,84,0.12)]">
            <div className="mx-auto grid h-32 w-32 place-items-center overflow-hidden rounded-[2.2rem] border-4 border-[#102A54] bg-gradient-to-br from-[#FFB199] to-[#FF6B57] text-center shadow-[6px_6px_0_rgba(16,42,84,0.18)]">
              <Image
                src={enemyImageUrl}
                alt={selectedMode.enemyName}
                width={320}
                height={320}
                className="h-full w-full object-cover"
              />
            </div>
            <h3 className="mt-4 text-2xl font-black">{selectedMode.enemyName}</h3>
            <p className="mt-1 text-sm font-bold text-[#102A54]/60">
              {selectedMode.label}
            </p>
            <p className="mt-2 rounded-2xl border-2 border-[#102A54]/15 bg-[#FFFEF8] px-3 py-2 text-xs font-black uppercase tracking-wide text-[#102A54]/60">
              Boss image {enemyImageUrl.replace("/pets/", "").replace(".png", "")}
            </p>
            <button
              type="button"
              onClick={rotateBossImage}
              className="mt-3 w-full rounded-2xl border-2 border-[#102A54] bg-[#FFFEF8] px-4 py-3 text-sm font-black shadow-[3px_3px_0_rgba(16,42,84,0.12)] transition hover:-translate-y-0.5 hover:bg-[#FFD95A]"
            >
              Change Boss
            </button>
            <div className="mt-4">
              <HpBar label="Enemy HP" hp={enemyHp} maxHp={adjustedEnemyMaxHp} tone="red" />
            </div>
          </div>
        </div>

        <div className="rounded-[1.75rem] border-2 border-[#102A54] bg-[#FFF7E2] p-5 text-[#102A54] shadow-[5px_5px_0_rgba(16,42,84,0.12)]">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <p className="text-xs font-black uppercase tracking-wide text-[#FF6B57]">
                Question {questionIndex + 1} / {questions.length}
              </p>
              <h3 className="mt-2 text-2xl font-black">{question.prompt}</h3>
            </div>
            <span className="rounded-full border-2 border-[#102A54] bg-[#7BE0C3] px-3 py-1 text-xs font-black text-[#102A54]">
              {question.subject}
            </span>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {question.options.map((option) => (
              <button
                type="button"
                key={option}
                onClick={() => handleAnswer(option)}
                className="rounded-2xl border-2 border-[#102A54] bg-[#FFFEF8] px-4 py-4 text-left text-sm font-black text-[#102A54] shadow-[3px_3px_0_rgba(16,42,84,0.12)] transition hover:-translate-y-0.5 hover:bg-[#FFD95A] active:scale-[0.99]"
              >
                {option}
              </button>
            ))}
          </div>

          <div className="mt-5 rounded-2xl border-2 border-[#102A54]/20 bg-[#FFFEF8] p-4">
            <p className="text-xs font-black uppercase tracking-wide text-[#102A54]/55">
              Battle log
            </p>
            <div className="mt-3 grid gap-2">
              {battleLog.map((message, index) => (
                <p
                  key={`${message}-${index}`}
                  className="rounded-xl bg-[#FFF7E2] px-3 py-2 text-sm font-bold text-[#102A54]"
                >
                  {message}
                </p>
              ))}
            </div>
            {selectedMode.mode === "class_boss" ? (
              <p className="mt-2 text-xs font-bold text-[#FF6B57]">
                Class task completion reduced boss HP by{" "}
                {Math.round(classCompletionRate * 100)}%.
              </p>
            ) : null}
          </div>
        </div>
      </div>

      {showResult ? (
        <div className="absolute inset-0 grid place-items-center bg-[#102A54]/55 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[2rem] border-4 border-[#102A54] bg-[#FFF7E2] p-6 text-[#102A54] shadow-[8px_8px_0_rgba(16,42,84,0.22)]">
            <p className="inline-flex rounded-full bg-[#FFD95A] px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-[#102A54]">
              Battle result
            </p>
            <h3 className="mt-2 text-3xl font-black">
              {won ? "Victory" : "Training complete"}
            </h3>
            <p className="mt-3 text-sm font-bold leading-6 text-[#102A54]/65">
              Correct answers: {correctCount} / {questions.length}. You earned{" "}
              {rewardXp} XP and {rewardCoins} Star Coins.
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => resetBattle(mode)}
                className="rounded-2xl border-2 border-[#102A54] bg-[#4FB8FF] px-4 py-3 text-sm font-black text-[#102A54] shadow-[3px_3px_0_#102A54]"
              >
                Battle again
              </button>
              <button
                type="button"
                onClick={() => setShowResult(false)}
                className="rounded-2xl border-2 border-[#102A54] bg-[#FFFEF8] px-4 py-3 text-sm font-black text-[#102A54]"
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
