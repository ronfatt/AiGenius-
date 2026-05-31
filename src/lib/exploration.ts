import type { Pet } from "./types";

export type ExplorationLocation = {
  id: string;
  name: string;
  area: string;
  durationMinutes: number;
  difficulty: "easy" | "normal" | "rare";
  discovery: string;
  rewardXp: number;
  rewardCoins: number;
  careBonus: string;
};

export const tawauExplorationLocations: ExplorationLocation[] = [
  {
    id: "tawau_hills",
    name: "Tawau Hills Park Trail",
    area: "Tawau Hills Park",
    durationMinutes: 45,
    difficulty: "normal",
    discovery: "Your pet found a quiet reading spot and practised new nature words.",
    rewardXp: 35,
    rewardCoins: 8,
    careBonus: "+Focus",
  },
  {
    id: "tanjung_batu",
    name: "Tanjung Batu Seaside Walk",
    area: "Tanjung Batu",
    durationMinutes: 30,
    difficulty: "easy",
    discovery: "Your pet listened to seaside sounds and collected vocabulary clues.",
    rewardXp: 25,
    rewardCoins: 6,
    careBonus: "+Mood",
  },
  {
    id: "sabindo",
    name: "Sabindo Word Hunt",
    area: "Sabindo",
    durationMinutes: 20,
    difficulty: "easy",
    discovery: "Your pet spotted English signs and matched them to meanings.",
    rewardXp: 20,
    rewardCoins: 5,
    careBonus: "+Vocabulary",
  },
  {
    id: "fajar",
    name: "Fajar Market Clue Run",
    area: "Fajar",
    durationMinutes: 25,
    difficulty: "easy",
    discovery: "Your pet asked polite questions and found three useful phrases.",
    rewardXp: 24,
    rewardCoins: 6,
    careBonus: "+Speaking",
  },
  {
    id: "kuhara",
    name: "Kuhara Grammar Post",
    area: "Kuhara",
    durationMinutes: 35,
    difficulty: "normal",
    discovery: "Your pet fixed sentence patterns at the academy notice board.",
    rewardXp: 32,
    rewardCoins: 7,
    careBonus: "+Grammar",
  },
  {
    id: "sri_indah",
    name: "Sri Indah Story Corner",
    area: "Sri Indah",
    durationMinutes: 40,
    difficulty: "normal",
    discovery: "Your pet joined a mini story circle and learned sequencing words.",
    rewardXp: 34,
    rewardCoins: 8,
    careBonus: "+Reading",
  },
  {
    id: "apas",
    name: "Apas Listening Quest",
    area: "Apas",
    durationMinutes: 30,
    difficulty: "normal",
    discovery: "Your pet followed classroom instructions through a listening game.",
    rewardXp: 30,
    rewardCoins: 7,
    careBonus: "+Listening",
  },
  {
    id: "balung",
    name: "Balung Orchard Notes",
    area: "Balung",
    durationMinutes: 60,
    difficulty: "rare",
    discovery: "Your pet wrote short observation notes and found a rare card clue.",
    rewardXp: 50,
    rewardCoins: 12,
    careBonus: "+Writing",
  },
  {
    id: "merotai",
    name: "Merotai Star Map",
    area: "Merotai",
    durationMinutes: 90,
    difficulty: "rare",
    discovery: "Your pet mapped a long adventure route and unlocked challenge words.",
    rewardXp: 70,
    rewardCoins: 18,
    careBonus: "+Courage",
  },
];

export function getRandomExploration(seed = Date.now()) {
  const index = Math.abs(seed) % tawauExplorationLocations.length;
  return tawauExplorationLocations[index];
}

export function getPetCareState(pet: Pet) {
  return {
    mood: Math.min(100, 62 + pet.kindness / 2),
    energy: Math.min(100, 58 + pet.speed / 2),
    bond: Math.min(100, 55 + pet.focus / 2),
  };
}
