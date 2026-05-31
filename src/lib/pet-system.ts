import type { Pet, PetStage, PetStats, RewardTransaction } from "./types";

const XP_PER_LEVEL = 100;
const MIN_ATTRIBUTE = 0;
const MAX_ATTRIBUTE = 100;

const stageOrder: PetStage[] = ["baby", "junior", "advanced", "legendary"];
const stageStartLevel: Record<PetStage, number> = {
  baby: 1,
  junior: 10,
  advanced: 25,
  legendary: 50,
};

function clampAttribute(value: number) {
  return Math.max(MIN_ATTRIBUTE, Math.min(MAX_ATTRIBUTE, Math.round(value)));
}

function getBaseAttributeGain(reward: RewardTransaction) {
  return Math.max(1, Math.round(reward.xpAmount / 25));
}

function getRewardStatBoost(reward: RewardTransaction): Partial<PetStats> {
  const gain = getBaseAttributeGain(reward);
  const reason = reward.reason.toLowerCase();

  const boost: Partial<PetStats> = {};

  if (reward.sourceType === "quiz" || reason.includes("score") || reason.includes("test")) {
    boost.power = gain * 2;
    boost.wisdom = gain;
  }

  if (
    reward.sourceType === "task" ||
    reason.includes("homework") ||
    reason.includes("submit")
  ) {
    boost.speed = (boost.speed ?? 0) + gain;
    boost.focus = (boost.focus ?? 0) + gain;
  }

  if (reason.includes("on time") || reason.includes("attendance") || reason.includes("class")) {
    boost.focus = (boost.focus ?? 0) + gain * 2;
  }

  if (
    reward.sourceType === "battle" ||
    reason.includes("challenge") ||
    reason.includes("difficulty")
  ) {
    boost.courage = gain * 2;
    boost.power = (boost.power ?? 0) + gain;
  }

  if (
    reward.sourceType === "behavior" ||
    reason.includes("behavior") ||
    reason.includes("help")
  ) {
    boost.kindness = gain * 2;
    boost.focus = (boost.focus ?? 0) + gain;
  }

  if (Object.keys(boost).length === 0) {
    boost.wisdom = gain;
    boost.focus = gain;
  }

  return boost;
}

export function calculatePetLevel(xp: number) {
  return Math.max(1, Math.floor(Math.max(0, xp) / XP_PER_LEVEL) + 1);
}

export function calculatePetStage(level: number): PetStage {
  if (level >= 50) return "legendary";
  if (level >= 25) return "advanced";
  if (level >= 10) return "junior";
  return "baby";
}

export function getEvolutionProgress(pet: Pet) {
  const level = calculatePetLevel(pet.xp);
  const calculatedStage = calculatePetStage(level);
  const currentStageIndex = stageOrder.indexOf(calculatedStage);
  const nextStage = stageOrder[currentStageIndex + 1] ?? null;
  const currentStageStartLevel = stageStartLevel[calculatedStage];
  const nextStageStartLevel = nextStage ? stageStartLevel[nextStage] : currentStageStartLevel;
  const levelsInStage = Math.max(1, nextStageStartLevel - currentStageStartLevel);
  const completedLevelsInStage = Math.max(0, level - currentStageStartLevel);
  const progressPercent = nextStage
    ? Math.min(100, Math.round((completedLevelsInStage / levelsInStage) * 100))
    : 100;
  const xpForNextStage = nextStage ? (nextStageStartLevel - 1) * XP_PER_LEVEL : pet.xp;
  const xpToNextStage = Math.max(0, xpForNextStage - pet.xp);

  return {
    currentStage: calculatedStage,
    nextStage,
    level,
    currentStageStartLevel,
    nextStageStartLevel: nextStage ? nextStageStartLevel : null,
    progressPercent,
    xpToNextStage,
    canEvolve: canEvolve({ ...pet, level }),
  };
}

export function applyStatBoost(stats: PetStats, boost: Partial<PetStats>): PetStats {
  return {
    power: clampAttribute(stats.power + (boost.power ?? 0)),
    wisdom: clampAttribute(stats.wisdom + (boost.wisdom ?? 0)),
    speed: clampAttribute(stats.speed + (boost.speed ?? 0)),
    focus: clampAttribute(stats.focus + (boost.focus ?? 0)),
    courage: clampAttribute(stats.courage + (boost.courage ?? 0)),
    kindness: clampAttribute(stats.kindness + (boost.kindness ?? 0)),
  };
}

export function applyRewardToPet(pet: Pet, reward: RewardTransaction): Pet {
  const xp = Math.max(0, pet.xp + reward.xpAmount);
  const level = calculatePetLevel(xp);
  const stats = applyStatBoost(
    {
      power: pet.power,
      wisdom: pet.wisdom,
      speed: pet.speed,
      focus: pet.focus,
      courage: pet.courage,
      kindness: pet.kindness,
    },
    getRewardStatBoost(reward),
  );

  return {
    ...pet,
    ...stats,
    xp,
    level,
    stage: pet.stage,
  };
}

export function canEvolve(pet: Pet) {
  const currentStageIndex = stageOrder.indexOf(pet.stage);
  const calculatedStageIndex = stageOrder.indexOf(
    calculatePetStage(calculatePetLevel(pet.xp)),
  );

  return calculatedStageIndex > currentStageIndex;
}

export function evolvePet(pet: Pet): Pet {
  const level = calculatePetLevel(pet.xp);
  const stage = calculatePetStage(level);

  return {
    ...pet,
    level,
    stage,
  };
}

export const getPetLevel = calculatePetLevel;
export const getEvolutionStage = calculatePetStage;
