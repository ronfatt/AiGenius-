import type { Pet } from "./types";
import { getPetCareState } from "./exploration";

export type PetEmotion =
  | "happy"
  | "excited"
  | "focused"
  | "proud"
  | "tired"
  | "hungry"
  | "sleepy";

export type PetEmotionDisplay = {
  emotion: PetEmotion;
  label: string;
  imageUrl: string;
  message: string;
};

const emotionOrder: Array<{ emotion: PetEmotion; label: string; message: string }> = [
  {
    emotion: "happy",
    label: "Happy",
    message: "Ready for today's learning.",
  },
  {
    emotion: "excited",
    label: "Excited",
    message: "Wants to explore or open a box.",
  },
  {
    emotion: "focused",
    label: "Focused",
    message: "Best state for English quests.",
  },
  {
    emotion: "proud",
    label: "Proud",
    message: "Feels great after finishing tasks.",
  },
  {
    emotion: "tired",
    label: "Tired",
    message: "Needs a short rest before exploring.",
  },
  {
    emotion: "hungry",
    label: "Hungry",
    message: "Feed the pet to restore mood.",
  },
  {
    emotion: "sleepy",
    label: "Sleepy",
    message: "Rest helps restore energy.",
  },
];

const supportedEmotionPets = new Set(
  Array.from({ length: 9 }, (_, index) => `pet${String(index + 1).padStart(2, "0")}`),
);

const missingEmotionAssets = new Set(["pet03_sleepy", "pet07_sleepy"]);

function getPetAssetKey(pet: Pet) {
  const match = pet.imageUrl.match(/pet(\d{2})/);
  const key = match ? `pet${match[1]}` : "pet01";

  return supportedEmotionPets.has(key) ? key : "";
}

export function getPetEmotionImageUrl(pet: Pet, emotion: PetEmotion) {
  const key = getPetAssetKey(pet);

  if (!key || missingEmotionAssets.has(`${key}_${emotion}`)) {
    return pet.imageUrl;
  }

  return `/pets/${key}_emotion/${key}_${emotion}.png`;
}

export function getPetEmotionSet(pet: Pet): PetEmotionDisplay[] {
  return emotionOrder.map((item) => ({
    ...item,
    imageUrl: getPetEmotionImageUrl(pet, item.emotion),
  }));
}

export function getCurrentPetEmotion(pet: Pet): PetEmotionDisplay {
  const care = getPetCareState(pet);
  let emotion: PetEmotion = "happy";

  if (care.energy < 65) emotion = "sleepy";
  else if (care.mood < 68) emotion = "hungry";
  else if (care.bond > 88 && care.mood > 88) emotion = "proud";
  else if (care.energy > 88) emotion = "excited";
  else if (care.bond > 82) emotion = "focused";

  return getPetEmotionSet(pet).find((item) => item.emotion === emotion) ?? getPetEmotionSet(pet)[0];
}
