"use server";

import { revalidatePath } from "next/cache";
import { getCurrentProfile } from "@/lib/auth";
import { applyRewardToPet, canEvolve, evolvePet } from "@/lib/pet-system";
import { getSupabaseServiceRoleClient } from "@/lib/supabase";
import type { Pet, PetRarity, PetStage, RewardTransaction } from "@/lib/types";

type ApproveReviewResult = {
  ok: boolean;
  message: string;
};

type DbPetForReview = {
  id: string;
  student_id: string;
  name: string;
  species: string;
  rarity: PetRarity;
  stage: PetStage;
  level: number;
  xp: number;
  power: number;
  wisdom: number;
  speed: number;
  focus: number;
  courage: number;
  kindness: number;
  image_url: string | null;
};

type SupabaseError = {
  message: string;
};

type ReviewQueryBuilder = {
  select: (columns: string) => ReviewQueryBuilder;
  eq: (column: string, value: unknown) => ReviewQueryBuilder;
  maybeSingle: <T>() => Promise<{ data: T | null; error: SupabaseError | null }>;
  update: (
    values: Record<string, unknown>,
  ) => { eq: (column: string, value: unknown) => Promise<{ error: SupabaseError | null }> };
  insert: (values: Record<string, unknown>) => Promise<{ error: SupabaseError | null }>;
};

type ReviewSupabaseClient = {
  from: (table: string) => ReviewQueryBuilder;
};

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function parseInteger(value: FormDataEntryValue | null) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? Math.max(0, Math.round(parsed)) : 0;
}

function parseWeakSkills(value: FormDataEntryValue | null) {
  if (!value) return [];

  try {
    const parsed = JSON.parse(String(value));
    if (!Array.isArray(parsed)) return [];

    return parsed
      .map((item) => String(item).trim())
      .filter((item) => item.length > 0)
      .slice(0, 8);
  } catch {
    return [];
  }
}

function toPet(row: DbPetForReview): Pet {
  return {
    id: row.id,
    studentId: row.student_id,
    name: row.name,
    species: row.species,
    rarity: row.rarity,
    stage: row.stage,
    level: row.level,
    xp: row.xp,
    power: row.power,
    wisdom: row.wisdom,
    speed: row.speed,
    focus: row.focus,
    courage: row.courage,
    kindness: row.kindness,
    imageUrl: row.image_url ?? "",
  };
}

async function markWeakSkills(input: {
  studentId: string;
  weakSkills: string[];
  reviewedAt: string;
}) {
  const supabase = getSupabaseServiceRoleClient() as unknown as ReviewSupabaseClient;

  await Promise.all(
    input.weakSkills.map(async (skill) => {
      const { data: existingSkill } = await supabase
        .from("subject_skills")
        .select("id,mastery_percentage")
        .eq("student_id", input.studentId)
        .eq("subject", "English")
        .eq("weakness_tag", skill)
        .maybeSingle<{ id: string; mastery_percentage: number }>();

      if (existingSkill) {
        await supabase
          .from("subject_skills")
          .update({
            mastery_percentage: Math.min(Number(existingSkill.mastery_percentage), 55),
            weakness_tag: skill,
            last_assessed_at: input.reviewedAt,
          })
          .eq("id", existingSkill.id);
        return;
      }

      await supabase.from("subject_skills").insert({
        student_id: input.studentId,
        subject: "English",
        skill_name: skill,
        level: 1,
        mastery_percentage: 55,
        weakness_tag: skill,
        last_assessed_at: input.reviewedAt,
      });
    }),
  );
}

export async function approveTeacherReviewAction(
  _previousState: ApproveReviewResult,
  formData: FormData,
): Promise<ApproveReviewResult> {
  const profile = await getCurrentProfile();

  if (!profile || profile.role !== "teacher") {
    return { ok: false, message: "Please login as a teacher first." };
  }

  const submissionId = String(formData.get("submissionId") ?? "");
  const studentId = String(formData.get("studentId") ?? "");
  const taskId = String(formData.get("taskId") ?? "");
  const teacherFeedback = String(formData.get("teacherFeedback") ?? "").trim();
  const xpAmount = parseInteger(formData.get("xpAmount"));
  const coinAmount = parseInteger(formData.get("coinAmount"));
  const reason = String(formData.get("reason") ?? "Teacher approved task reward.").trim();
  const weakSkills = parseWeakSkills(formData.get("weakSkills"));

  if (![submissionId, studentId, taskId].every((id) => uuidPattern.test(id))) {
    return {
      ok: false,
      message: "This is mock data. Supabase writes need real UUID submissions.",
    };
  }

  const supabase = getSupabaseServiceRoleClient() as unknown as ReviewSupabaseClient;
  const { data: task, error: taskError } = await supabase
    .from("learning_tasks")
    .select("id,teacher_id")
    .eq("id", taskId)
    .maybeSingle<{ id: string; teacher_id: string }>();

  if (taskError || !task || task.teacher_id !== profile.id) {
    return { ok: false, message: "You can only review tasks assigned by you." };
  }

  const { data: submission, error: submissionError } = await supabase
    .from("task_submissions")
    .select("id,task_id,student_id,status")
    .eq("id", submissionId)
    .maybeSingle<{ id: string; task_id: string; student_id: string; status: string }>();

  if (
    submissionError ||
    !submission ||
    submission.task_id !== taskId ||
    submission.student_id !== studentId
  ) {
    return { ok: false, message: "Submission not found or does not match this student." };
  }

  const reviewedAt = new Date().toISOString();
  const { error: reviewError } = await supabase
    .from("task_submissions")
    .update({
      status: "reviewed",
      teacher_feedback: teacherFeedback,
      reviewed_at: reviewedAt,
    })
    .eq("id", submissionId);

  if (reviewError) {
    return { ok: false, message: reviewError.message };
  }

  const { data: existingReward } = await supabase
    .from("reward_transactions")
    .select("id")
    .eq("student_id", studentId)
    .eq("source_id", submissionId)
    .maybeSingle<{ id: string }>();

  if (!existingReward && (xpAmount > 0 || coinAmount > 0)) {
    const { error: rewardError } = await supabase.from("reward_transactions").insert({
      student_id: studentId,
      source_type: "task",
      source_id: submissionId,
      xp_amount: xpAmount,
      coin_amount: coinAmount,
      reason,
    });

    if (rewardError) {
      return { ok: false, message: rewardError.message };
    }

    const { data: studentProfile } = await supabase
      .from("student_profiles")
      .select("id,total_xp,star_coins")
      .eq("id", studentId)
      .maybeSingle<{ id: string; total_xp: number; star_coins: number }>();

    if (studentProfile) {
      await supabase
        .from("student_profiles")
        .update({
          total_xp: Number(studentProfile.total_xp) + xpAmount,
          star_coins: Number(studentProfile.star_coins) + coinAmount,
        })
        .eq("id", studentId);
    }

    const { data: pet } = await supabase
      .from("pets")
      .select("id,student_id,name,species,rarity,stage,level,xp,power,wisdom,speed,focus,courage,kindness,image_url")
      .eq("student_id", studentId)
      .maybeSingle<DbPetForReview>();

    if (pet) {
      const reward: RewardTransaction = {
        id: `reward_${submissionId}`,
        studentId,
        sourceType: "task",
        sourceId: submissionId,
        xpAmount,
        coinAmount,
        reason,
        createdAt: reviewedAt,
      };
      const rewardedPet = applyRewardToPet(toPet(pet), reward);
      const evolvedPet = canEvolve(rewardedPet) ? evolvePet(rewardedPet) : rewardedPet;

      await supabase
        .from("pets")
        .update({
          xp: evolvedPet.xp,
          level: evolvedPet.level,
          stage: evolvedPet.stage,
          power: evolvedPet.power,
          wisdom: evolvedPet.wisdom,
          speed: evolvedPet.speed,
          focus: evolvedPet.focus,
          courage: evolvedPet.courage,
          kindness: evolvedPet.kindness,
        })
        .eq("id", pet.id);
    }
  }

  await markWeakSkills({ studentId, weakSkills, reviewedAt });

  revalidatePath("/teacher");
  revalidatePath("/teacher/reviews");

  return {
    ok: true,
    message: existingReward
      ? "Review saved. Reward was already issued before, so XP and coins were not duplicated."
      : "Review approved. Reward, weak skills, student totals, and pet XP were updated.",
  };
}
