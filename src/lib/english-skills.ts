export type EnglishCoreSkillDomain =
  | "Reading"
  | "Grammar"
  | "Vocabulary"
  | "Writing"
  | "Speaking"
  | "Listening";

export type EnglishSkillDomain =
  | EnglishCoreSkillDomain
  | "Listening"
  | "Speaking"
  | "Reading"
  | "Writing"
  | "Grammar"
  | "Vocabulary"
  | "Phonics"
  | "Pronunciation"
  | "Comprehension"
  | "Sentence Construction"
  | "Guided Writing"
  | "Language Arts";

export const englishCoreSkillDomains: EnglishCoreSkillDomain[] = [
  "Reading",
  "Grammar",
  "Vocabulary",
  "Writing",
  "Speaking",
  "Listening",
];

export const englishSkillDomains: EnglishSkillDomain[] = [
  "Listening",
  "Speaking",
  "Reading",
  "Writing",
  "Grammar",
  "Vocabulary",
  "Phonics",
  "Pronunciation",
  "Comprehension",
  "Sentence Construction",
  "Guided Writing",
  "Language Arts",
];

export const englishSkillTags: Record<EnglishSkillDomain, string[]> = {
  Listening: ["gist", "specific information", "classroom instructions"],
  Speaking: ["short response", "asking questions", "oral fluency"],
  Reading: ["main idea", "details", "context clues"],
  Writing: ["paragraph writing", "punctuation", "coherence"],
  Grammar: ["tenses", "subject-verb agreement", "sentence patterns"],
  Vocabulary: ["word meaning", "synonyms", "topic words"],
  Phonics: ["letter sounds", "blending", "word families"],
  Pronunciation: ["stress", "intonation", "clear sounds"],
  Comprehension: ["inference", "sequence", "cause and effect"],
  "Sentence Construction": ["word order", "connectors", "expanded sentences"],
  "Guided Writing": ["email", "short message", "story plan"],
  "Language Arts": ["poems", "chants", "creative response"],
};

export function getSkillTags(domain: EnglishSkillDomain) {
  return englishSkillTags[domain];
}
