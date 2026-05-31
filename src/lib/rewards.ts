import type {
  LearningTask,
  RewardSourceType,
  RewardTransaction,
  StudentTaskSubmission,
} from "./types";

export type RewardEventType =
  | "complete_normal_task"
  | "submit_homework_on_time"
  | "score_above_80"
  | "score_improved_15"
  | "correct_previous_mistakes"
  | "help_classmate"
  | "teacher_manual"
  | "challenge_task_completed";

export type RewardCalculationInput = {
  studentId: string;
  eventType: RewardEventType;
  task?: LearningTask;
  submission?: StudentTaskSubmission;
  previousScore?: number;
  repeatedLowLevelTaskCount?: number;
  existingRewardsForSameTask?: RewardTransaction[];
  manualReward?: {
    xp: number;
    starCoins: number;
    reason: string;
  };
};

export type RewardCalculationResult = {
  xp: number;
  starCoins: number;
  reason: string;
  sourceType: RewardSourceType;
  sourceId: string;
  appliedRules: string[];
};

const baseRewards: Record<RewardEventType, { xp: number; starCoins: number; reason: string }> = {
  complete_normal_task: {
    xp: 20,
    starCoins: 5,
    reason: "Completed normal task",
  },
  submit_homework_on_time: {
    xp: 10,
    starCoins: 3,
    reason: "Submitted homework on time",
  },
  score_above_80: {
    xp: 30,
    starCoins: 10,
    reason: "Scored above 80%",
  },
  score_improved_15: {
    xp: 40,
    starCoins: 15,
    reason: "Improved score by 15% or more",
  },
  correct_previous_mistakes: {
    xp: 25,
    starCoins: 8,
    reason: "Corrected previous mistakes",
  },
  help_classmate: {
    xp: 15,
    starCoins: 5,
    reason: "Helped a classmate",
  },
  teacher_manual: {
    xp: 0,
    starCoins: 0,
    reason: "Teacher manual reward",
  },
  challenge_task_completed: {
    xp: 60,
    starCoins: 20,
    reason: "Completed challenge task",
  },
};

function clampReward(value: number) {
  return Math.max(0, Math.round(value));
}

function getDifficultyMultiplier(task?: LearningTask) {
  if (!task) return 1;

  return 1 + Math.max(0, task.difficultyLevel - 1) * 0.15;
}

function getRepeatMultiplier(input: RewardCalculationInput) {
  const repeatCount = input.repeatedLowLevelTaskCount ?? 0;
  const isLowLevelTask = (input.task?.difficultyLevel ?? 1) <= 2;

  if (!isLowLevelTask || repeatCount <= 0) return 1;
  if (repeatCount === 1) return 0.7;
  if (repeatCount === 2) return 0.45;
  return 0.25;
}

function getSameTaskCoinMultiplier(input: RewardCalculationInput) {
  const sameTaskRewards = input.existingRewardsForSameTask ?? [];
  const alreadyRewardedCoins = sameTaskRewards.some((reward) => reward.coinAmount > 0);

  return alreadyRewardedCoins ? 0 : 1;
}

function getSourceType(eventType: RewardEventType): RewardSourceType {
  if (eventType === "help_classmate") return "behavior";
  if (eventType === "teacher_manual") return "manual";
  if (eventType === "challenge_task_completed") return "battle";
  if (eventType === "score_above_80" || eventType === "score_improved_15") return "quiz";
  return "task";
}

function shouldPrioritizeImprovement(input: RewardCalculationInput) {
  if (input.previousScore === undefined || input.submission === undefined) return false;

  return input.submission.score - input.previousScore >= 15;
}

export function calculateReward(input: RewardCalculationInput): RewardCalculationResult {
  const appliedRules: string[] = [];
  const isImprovementReward =
    input.eventType === "score_improved_15" || shouldPrioritizeImprovement(input);
  const selectedEventType = isImprovementReward ? "score_improved_15" : input.eventType;
  const base =
    selectedEventType === "teacher_manual" && input.manualReward
      ? {
          xp: input.manualReward.xp,
          starCoins: input.manualReward.starCoins,
          reason: input.manualReward.reason,
        }
      : baseRewards[selectedEventType];

  let xp = base.xp;
  let starCoins = base.starCoins;

  if (selectedEventType === "score_improved_15" && input.eventType === "score_above_80") {
    appliedRules.push("Improvement reward prioritized over perfect score reward");
  }

  const difficultyMultiplier = getDifficultyMultiplier(input.task);
  if (difficultyMultiplier > 1) {
    xp *= difficultyMultiplier;
    starCoins *= difficultyMultiplier;
    appliedRules.push("Higher difficulty reward multiplier applied");
  }

  const repeatMultiplier = getRepeatMultiplier(input);
  if (repeatMultiplier < 1) {
    xp *= repeatMultiplier;
    starCoins *= repeatMultiplier;
    appliedRules.push("Repeated low-level task reward reduced");
  }

  const coinMultiplier = getSameTaskCoinMultiplier(input);
  if (coinMultiplier === 0) {
    starCoins = 0;
    appliedRules.push("Star Coin farming blocked for same task");
  }

  return {
    xp: clampReward(xp),
    starCoins: clampReward(starCoins),
    reason: base.reason,
    sourceType: getSourceType(selectedEventType),
    sourceId: input.task?.id ?? input.submission?.id ?? "manual",
    appliedRules,
  };
}

export function createRewardForEvent(input: RewardCalculationInput): RewardTransaction {
  const reward = calculateReward(input);

  return createRewardTransaction({
    studentId: input.studentId,
    reason: reward.reason,
    xp: reward.xp,
    starCoins: reward.starCoins,
    sourceType: reward.sourceType,
    sourceId: reward.sourceId,
  });
}

export function calculateTaskReward(task: LearningTask) {
  const reward = calculateReward({
    studentId: "preview",
    eventType: task.difficultyLevel >= 4 ? "challenge_task_completed" : "complete_normal_task",
    task,
  });

  return {
    xp: reward.xp,
    starCoins: reward.starCoins,
  };
}

export function createRewardTransaction(input: {
  studentId: string;
  reason: string;
  xp: number;
  starCoins: number;
  sourceType?: RewardSourceType;
  sourceId?: string;
}): RewardTransaction {
  return {
    id: `reward_${Date.now()}`,
    studentId: input.studentId,
    sourceType: input.sourceType ?? "manual",
    sourceId: input.sourceId ?? "manual",
    reason: input.reason,
    xpAmount: clampReward(input.xp),
    coinAmount: clampReward(input.starCoins),
    createdAt: new Date().toISOString(),
  };
}
