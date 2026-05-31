import type { PetCard } from "./types";

export type BlindBoxTier = "normal" | "star" | "rare";

export type BlindBox = {
  id: string;
  tier: BlindBoxTier;
  name: string;
  costCoins: number;
  theme: string;
  rarityHint: string;
  appearanceRate: string;
  description: string;
  colorClass: string;
  imageUrl: string;
};

export type BoxReward =
  | {
      rewardType: "card" | "item" | "xp" | "coin" | "skill";
      name: string;
      rarity: "basic" | "advanced";
      description: string;
      xpAmount: number;
      coinAmount: number;
      card?: PetCard;
    }
  | {
      rewardType: "limited_pet";
      name: string;
      rarity: "limited";
      description: string;
      petBase: string;
      decoration: string;
      collectionNo: number;
      imageUrl: string;
      xpAmount: number;
      coinAmount: number;
    };

type GrowthRewardType = Exclude<BoxReward["rewardType"], "limited_pet">;

export const blindBoxes: BlindBox[] = [
  {
    id: "normal_box",
    tier: "normal",
    name: "Normal Box",
    costCoins: 10,
    theme: "Basic mixed rewards",
    rarityHint: "Basic pets, items, XP, coins, skills",
    appearanceRate: "Very common",
    description: "Entry-level box for daily learners. Gives small but useful growth rewards.",
    colorClass: "from-[#FFD95A] to-[#FFF7E2]",
    imageUrl: "/pets/normalbox.png",
  },
  {
    id: "star_box",
    tier: "star",
    name: "Star Box",
    costCoins: 35,
    theme: "Level 2 advanced rewards",
    rarityHint: "Advanced items, stronger XP, better skills",
    appearanceRate: "Uncommon",
    description: "A stronger box for consistent students. Better boosts and higher-value items.",
    colorClass: "from-[#4FB8FF] to-[#7BE0C3]",
    imageUrl: "/pets/starbox.png",
  },
  {
    id: "rare_box",
    tier: "rare",
    name: "Rare Box",
    costCoins: 80,
    theme: "Limited pet collection",
    rarityHint: "Only limited pet styles",
    appearanceRate: "Ultra rare",
    description: "Rare Box only draws limited pet looks: 9 pets x 9 decorations = 81 collectible styles.",
    colorClass: "from-[#FFB199] to-[#FFD95A]",
    imageUrl: "/pets/rarebox.png",
  },
];

const normalRewards = [
  "Small XP Gem",
  "Coin Pouch",
  "Focus Snack",
  "Vocabulary Spark",
  "Basic Pet Card",
  "Homework Shield",
];

const starRewards = [
  "Level 2 XP Crystal",
  "Grammar Booster",
  "Reading Compass",
  "Star Coin Bundle",
  "Advanced Pet Card",
  "Skill Mastery Badge",
];

const petBases = [
  "Flower Cat",
  "Moon Pup",
  "Comet Fox",
  "Cloud Bun",
  "Star Cub",
  "Bubble Dragon",
  "Mango Sprite",
  "Crystal Owl",
  "Galaxy Panda",
];

const decorations = [
  "Ribbon Bloom",
  "Star Crown",
  "Moon Cape",
  "Gold Glasses",
  "Explorer Hat",
  "Mint Scarf",
  "Coral Wings",
  "Academy Badge",
  "Rainbow Aura",
];

export function getRandomBlindBoxShelf(seed = Date.now()) {
  return Array.from({ length: 3 }, (_, slotIndex) => {
    const roll = Math.abs((seed + slotIndex * 7919) % 10000);

    if (roll === 7777) {
      return blindBoxes.find((box) => box.tier === "rare") ?? blindBoxes[0];
    }

    if (roll < 850) {
      return blindBoxes.find((box) => box.tier === "star") ?? blindBoxes[0];
    }

    return blindBoxes.find((box) => box.tier === "normal") ?? blindBoxes[0];
  });
}

export function getLimitedPetCollection() {
  return petBases.flatMap((petBase, petIndex) =>
    decorations.map((decoration, decorationIndex) => ({
      petBase,
      decoration,
      collectionNo: petIndex * decorations.length + decorationIndex + 1,
      imageUrl: `/pets/pet${String((petIndex % 9) + 1).padStart(2, "0")}.png`,
    })),
  );
}

export function drawBlindBox(boxId: string, cards: PetCard[], seed = Date.now()): BoxReward {
  const box = blindBoxes.find((item) => item.id === boxId) ?? blindBoxes[0];
  const safeCards = cards.length > 0 ? cards : [];

  if (box.tier === "rare") {
    const collection = getLimitedPetCollection();
    const prize = collection[Math.abs(seed) % collection.length];

    return {
      rewardType: "limited_pet",
      name: `${prize.petBase} - ${prize.decoration}`,
      rarity: "limited",
      description: `Limited pet style #${prize.collectionNo}/81. Rare Box only contains collectible pet looks.`,
      petBase: prize.petBase,
      decoration: prize.decoration,
      collectionNo: prize.collectionNo,
      imageUrl: prize.imageUrl,
      xpAmount: 0,
      coinAmount: 0,
    };
  }

  const rewardNames = box.tier === "star" ? starRewards : normalRewards;
  const rewardName = rewardNames[Math.abs(seed) % rewardNames.length];
  const rewardTypePool: GrowthRewardType[] =
    box.tier === "star"
      ? ["item", "xp", "coin", "skill", "card"]
      : ["item", "xp", "coin", "skill"];
  const rewardType = rewardTypePool[Math.abs(seed + 3) % rewardTypePool.length];
  const card = safeCards[Math.abs(seed + 7) % Math.max(1, safeCards.length)];
  const isStar = box.tier === "star";

  return {
    rewardType,
    name: rewardType === "card" && card ? card.name : rewardName,
    rarity: isStar ? "advanced" : "basic",
    description:
      rewardType === "card" && card
        ? card.effect
        : `${box.name} reward for daily learning progress.`,
    xpAmount: rewardType === "xp" ? (isStar ? 80 : 25) : isStar ? 20 : 8,
    coinAmount: rewardType === "coin" ? (isStar ? 25 : 8) : isStar ? 5 : 2,
    card,
  };
}
