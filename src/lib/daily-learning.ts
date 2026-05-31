import type { CefrLevel } from "./cefr-level";
import type { EnglishCoreSkillDomain } from "./english-skills";

export type DailyLearningTile = {
  id: string;
  title: string;
  skillDomain: EnglishCoreSkillDomain;
  cefrLevel: CefrLevel;
  durationMinutes: number;
  difficulty: "Foundation" | "Standard" | "Challenge";
  xpReward: number;
  coinReward: number;
  prompt: string;
  group: "required" | "bonus";
};

const dailyPool: DailyLearningTile[] = [
  {
    id: "daily_reading_01",
    title: "Read & Find Main Idea",
    skillDomain: "Reading",
    cefrLevel: "A1",
    durationMinutes: 5,
    difficulty: "Foundation",
    xpReward: 18,
    coinReward: 4,
    prompt: "Read a short paragraph and choose the most important point.",
    group: "required",
  },
  {
    id: "daily_grammar_01",
    title: "Present Simple Drill",
    skillDomain: "Grammar",
    cefrLevel: "A2",
    durationMinutes: 4,
    difficulty: "Standard",
    xpReward: 22,
    coinReward: 5,
    prompt: "Choose the correct verb form in three short sentences.",
    group: "required",
  },
  {
    id: "daily_vocab_01",
    title: "Word Meaning Match",
    skillDomain: "Vocabulary",
    cefrLevel: "A1",
    durationMinutes: 3,
    difficulty: "Foundation",
    xpReward: 16,
    coinReward: 4,
    prompt: "Match new words with simple meanings.",
    group: "required",
  },
  {
    id: "daily_writing_01",
    title: "Two-Sentence Writing",
    skillDomain: "Writing",
    cefrLevel: "A2",
    durationMinutes: 7,
    difficulty: "Standard",
    xpReward: 28,
    coinReward: 7,
    prompt: "Write two clear sentences about your pet adventure.",
    group: "bonus",
  },
  {
    id: "daily_speaking_01",
    title: "Say It Clearly",
    skillDomain: "Speaking",
    cefrLevel: "A1",
    durationMinutes: 3,
    difficulty: "Foundation",
    xpReward: 15,
    coinReward: 3,
    prompt: "Practise one short answer aloud.",
    group: "bonus",
  },
  {
    id: "daily_listening_01",
    title: "Instruction Catch",
    skillDomain: "Listening",
    cefrLevel: "A1",
    durationMinutes: 4,
    difficulty: "Standard",
    xpReward: 20,
    coinReward: 5,
    prompt: "Listen to classroom-style instructions and choose the right action.",
    group: "bonus",
  },
  {
    id: "daily_reading_02",
    title: "Context Clue Search",
    skillDomain: "Reading",
    cefrLevel: "A2",
    durationMinutes: 6,
    difficulty: "Challenge",
    xpReward: 35,
    coinReward: 9,
    prompt: "Use surrounding words to guess meaning.",
    group: "bonus",
  },
  {
    id: "daily_grammar_02",
    title: "Fix the Sentence",
    skillDomain: "Grammar",
    cefrLevel: "A2",
    durationMinutes: 5,
    difficulty: "Challenge",
    xpReward: 32,
    coinReward: 8,
    prompt: "Find and correct one grammar mistake.",
    group: "bonus",
  },
];

export function getDailyLearningTiles(seed = new Date().getDate()) {
  const required = dailyPool.filter((tile) => tile.group === "required");
  const bonus = dailyPool.filter((tile) => tile.group === "bonus");

  return [
    ...Array.from({ length: 3 }, (_, index) => required[(seed + index) % required.length]),
    ...Array.from({ length: 2 }, (_, index) => bonus[(seed + index * 2) % bonus.length]),
  ];
}
