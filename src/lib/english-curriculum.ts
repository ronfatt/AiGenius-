import type { CefrLevel } from "./cefr-level";
import { getCefrTargetForGrade } from "./cefr-level";
import type { EnglishCoreSkillDomain, EnglishSkillDomain } from "./english-skills";
import { englishCoreSkillDomains, getSkillTags } from "./english-skills";
import type { EnglishTaskQuestion, LearningTaskBand } from "./types";

export type EnglishCurriculumStandard = {
  id: string;
  schoolGrade: string;
  cefrLevel: CefrLevel;
  skillDomain: EnglishSkillDomain;
  standardCode: string;
  learningObjective: string;
  successCriteria: string[];
};

export type EnglishTaskTemplate = {
  id: string;
  title: string;
  schoolGrade: string;
  cefrLevel: CefrLevel;
  skillDomain: EnglishCoreSkillDomain;
  skillTags: string[];
  difficultyLevel: 1 | 2 | 3 | 4 | 5;
  taskBand: LearningTaskBand;
  description: string;
  questions: EnglishTaskQuestion[];
};

export const malaysiaPrimaryEnglishGrades = [
  "Year 1",
  "Year 2",
  "Year 3",
  "Year 4",
  "Year 5",
  "Year 6",
] as const;

const gradeDomains: Record<string, EnglishCoreSkillDomain[]> = {
  "Year 1": ["Listening", "Speaking", "Reading", "Vocabulary"],
  "Year 2": ["Listening", "Speaking", "Reading", "Writing", "Vocabulary"],
  "Year 3": englishCoreSkillDomains,
  "Year 4": englishCoreSkillDomains,
  "Year 5": englishCoreSkillDomains,
  "Year 6": englishCoreSkillDomains,
};

export const englishCurriculumStandards: EnglishCurriculumStandard[] = Object.entries(
  gradeDomains,
).flatMap(([schoolGrade, domains]) =>
  domains.map((skillDomain, index) => ({
    id: `english_${schoolGrade.toLowerCase().replaceAll(" ", "_")}_${index + 1}`,
    schoolGrade,
    cefrLevel: getCefrTargetForGrade(schoolGrade),
    skillDomain,
    standardCode: `ENG-${schoolGrade.replace("Year ", "Y")}-${index + 1}`,
    learningObjective: `Develop ${skillDomain.toLowerCase()} skills for ${schoolGrade} English, aligned to Malaysia primary CEFR progression.`,
    successCriteria: getSkillTags(skillDomain).slice(0, 3),
  })),
);

export function getTaskBandForLearningGap(input: {
  schoolGrade: string;
  actualLearningLevel: string | number;
}): LearningTaskBand {
  const grade = Number(input.schoolGrade.match(/\d+/)?.[0] ?? 0);
  const actual =
    typeof input.actualLearningLevel === "number"
      ? input.actualLearningLevel
      : Number(input.actualLearningLevel.match(/\d+(\.\d+)?/)?.[0] ?? 0);

  if (actual < grade) return "Foundation";
  if (actual > grade) return "Challenge";
  return "Standard";
}

export function getEnglishTaskQuestions(input: {
  schoolGrade: string;
  cefrLevel: CefrLevel;
  skillDomain: EnglishCoreSkillDomain;
  weaknessTag: string;
  taskBand: LearningTaskBand;
}): EnglishTaskQuestion[] {
  const context = `${input.schoolGrade} CEFR ${input.cefrLevel} ${input.taskBand}`;

  return [
    {
      id: "reading",
      type: "reading",
      prompt: `Read this ${context} passage: "Aiman joins an English club after school. He reads a short story and tells his friend the main idea." What is the main idea?`,
      options: [
        "Aiman learns through an English club.",
        "Aiman loses his school bag.",
        "Aiman skips his homework.",
        "Aiman buys a new pet.",
      ],
      answer: "Aiman learns through an English club.",
      explanation: "The passage focuses on Aiman learning English through reading and sharing the main idea.",
    },
    {
      id: "grammar",
      type: "grammar",
      prompt: `Choose the correct ${input.weaknessTag} sentence.`,
      options: [
        "She go to class every Monday.",
        "She goes to class every Monday.",
        "She going to class every Monday.",
        "She gone to class every Monday.",
      ],
      answer: "She goes to class every Monday.",
      explanation: "Use 'goes' with the third-person singular subject 'she' in the present simple tense.",
    },
    {
      id: "vocabulary",
      type: "vocabulary",
      prompt: "Which word is closest in meaning to 'improve'?",
      options: ["become better", "become louder", "become late", "become smaller"],
      answer: "become better",
      explanation: "'Improve' means to become better.",
    },
  ];
}

export function getEnglishStandardsForGrade(schoolGrade: string) {
  return englishCurriculumStandards.filter(
    (standard) => standard.schoolGrade === schoolGrade,
  );
}

export function getEnglishTaskTemplates(schoolGrade: string): EnglishTaskTemplate[] {
  return getEnglishStandardsForGrade(schoolGrade).map((standard, index) => ({
    id: `template_${standard.id}`,
    title: `${standard.skillDomain} Quest ${index + 1}`,
    schoolGrade: standard.schoolGrade,
    cefrLevel: standard.cefrLevel,
    skillDomain: standard.skillDomain as EnglishCoreSkillDomain,
    skillTags: standard.successCriteria,
    difficultyLevel: Math.min(5, index + 2) as 1 | 2 | 3 | 4 | 5,
    taskBand: index < 2 ? "Foundation" : index > 3 ? "Challenge" : "Standard",
    description: `${standard.learningObjective} Focus on ${standard.successCriteria.join(", ")}.`,
    questions: getEnglishTaskQuestions({
      schoolGrade: standard.schoolGrade,
      cefrLevel: standard.cefrLevel,
      skillDomain: standard.skillDomain as EnglishCoreSkillDomain,
      weaknessTag: standard.successCriteria[0],
      taskBand: index < 2 ? "Foundation" : index > 3 ? "Challenge" : "Standard",
    }),
  }));
}

export function getRecommendedEnglishFocus(input: {
  schoolGrade: string;
  weakSkillTags: string[];
}) {
  const standards = getEnglishStandardsForGrade(input.schoolGrade);

  return standards.filter((standard) =>
    standard.successCriteria.some((criteria) =>
      input.weakSkillTags.some((tag) => criteria.includes(tag) || tag.includes(criteria)),
    ),
  );
}
