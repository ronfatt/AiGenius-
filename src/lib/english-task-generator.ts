import type { CefrLevel } from "./cefr-level";
import type { EnglishCoreSkillDomain } from "./english-skills";
import { getSkillTags } from "./english-skills";
import type { LearningTaskBand } from "./types";

export type EnglishTaskGeneratorInput = {
  className: string;
  schoolGrade: string;
  cefrLevel: CefrLevel;
  skillDomain: EnglishCoreSkillDomain;
  weaknessTag: string;
  taskBand: LearningTaskBand;
  difficultyLevel: 1 | 2 | 3 | 4 | 5;
};

export type GeneratedEnglishTask = {
  title: string;
  description: string;
  readingPassage: string;
  readingQuestion: string;
  grammarQuestion: string;
  vocabularyQuestion: string;
  options: string[];
  answers: {
    reading: string;
    grammar: string;
    vocabulary: string;
  };
  feedback: {
    reading: string;
    grammar: string;
    vocabulary: string;
  };
  cefrLevel: CefrLevel;
  schoolGrade: string;
  skillDomain: EnglishCoreSkillDomain;
  skillTags: string[];
  taskBand: LearningTaskBand;
  difficultyLevel: 1 | 2 | 3 | 4 | 5;
  xpReward: number;
  coinReward: number;
};

export function calculateEnglishTaskReward(input: {
  difficultyLevel: number;
  taskBand: LearningTaskBand;
}) {
  const bandBonus = input.taskBand === "Challenge" ? 25 : input.taskBand === "Foundation" ? 5 : 15;

  return {
    xpReward: 20 + input.difficultyLevel * 12 + bandBonus,
    coinReward: 5 + input.difficultyLevel * 3 + Math.round(bandBonus / 5),
  };
}

export function buildMockGeneratedEnglishTask(
  input: EnglishTaskGeneratorInput,
): GeneratedEnglishTask {
  const skillTags = getSkillTags(input.skillDomain);
  const rewards = calculateEnglishTaskReward(input);

  return {
    title: `${input.schoolGrade} ${input.skillDomain} ${input.taskBand} Quest`,
    description: `Malaysia-aligned English task for ${input.className}. Focus: ${input.weaknessTag}. CEFR target: ${input.cefrLevel}.`,
    readingPassage:
      "Sara joins an English reading circle at her tuition centre. She reads a short story, finds the main idea, and explains one new word to her partner.",
    readingQuestion: "What did Sara practise during the reading circle?",
    grammarQuestion: "Choose the correct sentence.",
    vocabularyQuestion: "Which word is closest in meaning to 'explain'?",
    options: [
      "She practised reading, main idea, and vocabulary.",
      "She played a phone game only.",
      "She forgot her tuition class.",
      "She bought a new school bag.",
    ],
    answers: {
      reading: "She practised reading, main idea, and vocabulary.",
      grammar: "She explains the word to her partner.",
      vocabulary: "make clear",
    },
    feedback: {
      reading: "Look for the action that happens through the whole passage.",
      grammar: "Use the present simple verb form with a singular subject.",
      vocabulary: "'Explain' means to make an idea clear.",
    },
    cefrLevel: input.cefrLevel,
    schoolGrade: input.schoolGrade,
    skillDomain: input.skillDomain,
    skillTags,
    taskBand: input.taskBand,
    difficultyLevel: input.difficultyLevel,
    ...rewards,
  };
}
