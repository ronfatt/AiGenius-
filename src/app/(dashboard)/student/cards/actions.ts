"use server";

import crypto from "node:crypto";
import { revalidatePath } from "next/cache";
import { getCurrentProfile } from "@/lib/auth";
import { blindBoxes, drawBlindBox } from "@/lib/blind-boxes";
import { getSupabaseServiceRoleClient } from "@/lib/supabase";
import type { PetCardRarity } from "@/lib/types";

type DrawBlindBoxState = {
  ok: boolean;
  message: string;
  reward?: {
    name: string;
    rewardType: string;
    xpAmount: number;
    coinAmount: number;
    imageUrl?: string;
    description: string;
  };
};

type SupabaseError = {
  message: string;
};

type StudentProfileRow = {
  id: string;
  star_coins: number;
  total_xp: number;
};

type CardRow = {
  id: string;
};

type InventoryRow = {
  id: string;
  quantity: number;
};

type QueryBuilder = {
  select: (columns: string) => QueryBuilder;
  eq: (column: string, value: unknown) => QueryBuilder;
  maybeSingle: <T>() => Promise<{ data: T | null; error: SupabaseError | null }>;
  insert: (values: Record<string, unknown>) => PromiseLike<{ error: SupabaseError | null }>;
  update: (
    values: Record<string, unknown>,
  ) => { eq: (column: string, value: unknown) => Promise<{ error: SupabaseError | null }> };
};

type SupabaseClient = {
  from: (table: string) => QueryBuilder;
};

function deterministicUuid(input: string) {
  const hash = crypto.createHash("sha256").update(input).digest("hex");
  return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-4${hash.slice(13, 16)}-8${hash.slice(17, 20)}-${hash.slice(20, 32)}`;
}

function cardRarityForReward(rewardType: string, boxTier: string): PetCardRarity {
  if (boxTier === "rare") return "legendary";
  if (rewardType === "card") return "rare";
  if (boxTier === "star") return "epic";
  return "common";
}

export async function drawBlindBoxAction(
  _previousState: DrawBlindBoxState,
  formData: FormData,
): Promise<DrawBlindBoxState> {
  const profile = await getCurrentProfile();

  if (!profile || profile.role !== "student") {
    return { ok: false, message: "Please login as a student first." };
  }

  const boxId = String(formData.get("boxId") ?? "");
  const selectedBox = blindBoxes.find((box) => box.id === boxId);

  if (!selectedBox) {
    return { ok: false, message: "Blind box not found." };
  }

  const supabase = getSupabaseServiceRoleClient() as unknown as SupabaseClient;
  const { data: student } = await supabase
    .from("student_profiles")
    .select("id,star_coins,total_xp")
    .eq("user_id", profile.id)
    .maybeSingle<StudentProfileRow>();

  if (!student) {
    return { ok: false, message: "Student profile not found." };
  }

  if (student.star_coins < selectedBox.costCoins) {
    return { ok: false, message: `Need ${selectedBox.costCoins} Star Coins to open this box.` };
  }

  const reward = drawBlindBox(selectedBox.id, [], Date.now() + student.star_coins);
  const rewardKey =
    reward.rewardType === "limited_pet"
      ? `limited_pet_${reward.collectionNo}`
      : `${selectedBox.tier}_${reward.rewardType}_${reward.name}`;
  const cardId = deterministicUuid(rewardKey);
  const cardName = reward.name;
  const cardType = reward.rewardType;
  const cardEffect =
    reward.rewardType === "limited_pet"
      ? reward.description
      : `${reward.description} +${reward.xpAmount} XP and +${reward.coinAmount} coins.`;
  const cardImageUrl = reward.rewardType === "limited_pet" ? reward.imageUrl : selectedBox.imageUrl;
  const { data: existingCard } = await supabase
    .from("pet_cards")
    .select("id")
    .eq("id", cardId)
    .maybeSingle<CardRow>();

  if (!existingCard) {
    const insertCardResult = await supabase
      .from("pet_cards")
      .insert({
        id: cardId,
        name: cardName,
        rarity: cardRarityForReward(reward.rewardType, selectedBox.tier),
        type: cardType,
        effect: cardEffect,
        image_url: cardImageUrl,
      });

    if ("error" in insertCardResult && insertCardResult.error) {
      return { ok: false, message: insertCardResult.error.message };
    }
  }

  const { data: existingInventory } = await supabase
    .from("student_card_inventory")
    .select("id,quantity")
    .eq("student_id", student.id)
    .eq("card_id", cardId)
    .maybeSingle<InventoryRow>();

  if (existingInventory) {
    const { error } = await supabase
      .from("student_card_inventory")
      .update({ quantity: Number(existingInventory.quantity) + 1, obtained_at: new Date().toISOString() })
      .eq("id", existingInventory.id);

    if (error) return { ok: false, message: error.message };
  } else {
    const inventoryInsert = await supabase.from("student_card_inventory").insert({
      student_id: student.id,
      card_id: cardId,
      quantity: 1,
      obtained_at: new Date().toISOString(),
    });

    if ("error" in inventoryInsert && inventoryInsert.error) {
      return { ok: false, message: inventoryInsert.error.message };
    }
  }

  const nextCoins = Math.max(0, Number(student.star_coins) - selectedBox.costCoins + reward.coinAmount);
  const nextXp = Number(student.total_xp) + reward.xpAmount;
  const { error: studentUpdateError } = await supabase
    .from("student_profiles")
    .update({
      star_coins: nextCoins,
      total_xp: nextXp,
    })
    .eq("id", student.id);

  if (studentUpdateError) {
    return { ok: false, message: studentUpdateError.message };
  }

  if (reward.xpAmount > 0 || reward.coinAmount > 0) {
    const rewardInsert = await supabase.from("reward_transactions").insert({
      student_id: student.id,
      source_type: "manual",
      source_id: cardId,
      xp_amount: reward.xpAmount,
      coin_amount: reward.coinAmount,
      reason: `Blind Box reward: ${reward.name}`,
    });

    if ("error" in rewardInsert && rewardInsert.error) {
      return { ok: false, message: rewardInsert.error.message };
    }
  }

  const drawInsert = await supabase.from("blind_box_draws").insert({
    student_id: student.id,
    box_id: selectedBox.id,
    box_tier: selectedBox.tier,
    reward_type: reward.rewardType,
    reward_name: reward.name,
    reward_payload: reward,
  });

  if ("error" in drawInsert && drawInsert.error) {
    return { ok: false, message: drawInsert.error.message };
  }

  revalidatePath("/student");
  revalidatePath("/student/cards");

  return {
    ok: true,
    message: `${selectedBox.name} opened. Reward saved to your collection.`,
    reward: {
      name: reward.name,
      rewardType: reward.rewardType,
      xpAmount: reward.xpAmount,
      coinAmount: reward.coinAmount,
      imageUrl: reward.rewardType === "limited_pet" ? reward.imageUrl : selectedBox.imageUrl,
      description: reward.description,
    },
  };
}
