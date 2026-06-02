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
  upsert: (
    values: Record<string, unknown>,
    options?: Record<string, unknown>,
  ) => Promise<{ error: SupabaseError | null }>;
};

type ReviewSupabaseClient = {
  from: (table: string) => ReviewQueryBuilder;
};

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function getCurrentReportMonth() {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "Asia/Kuala_Lumpur",
  }).format(new Date());
}

function uniqueList(items: Array<string | null | undefined>, limit = 8) {
  return [...new Set(items.map((item) => String(item ?? "").trim()).filter(Boolean))].slice(0, limit);
}

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

async function upsertParentReportProgress(input: {
  studentId: string;
  studentName: string;
  taskTitle: string;
  skillDomain: string;
  cefrLevel: string;
  schoolGrade: string;
  score: number;
  weakSkills: string[];
  teacherFeedback: string;
  reviewedAt: string;
}): Promise<SupabaseError | null> {
  const supabase = getSupabaseServiceRoleClient() as unknown as ReviewSupabaseClient;
  const month = getCurrentReportMonth();
  const scoreBand =
    input.score >= 85 ? "strong mastery" : input.score >= 60 ? "steady progress" : "foundation support";
  const strengths =
    input.score >= 85
      ? [`${input.skillDomain} confidence`, `${input.cefrLevel} task readiness`]
      : input.score >= 60
        ? [`${input.skillDomain} participation`, "correction readiness"]
        : ["learning effort"];
  const weaknesses =
    input.weakSkills.length > 0
      ? input.weakSkills
      : input.score < 60
        ? [input.skillDomain]
        : [];
  const recommendations =
    input.score >= 85
      ? [`Give one ${input.cefrLevel} challenge task for ${input.skillDomain}.`]
      : input.score >= 60
        ? [`Review missed ${input.skillDomain} questions before the next standard quest.`]
        : [`Use foundation examples for ${weaknesses[0] ?? input.skillDomain} before moving on.`];

  const { data: existingReport } = await supabase
    .from("parent_reports")
    .select("summary,strengths,weaknesses,recommendations,teacher_comment")
    .eq("student_id", input.studentId)
    .eq("month", month)
    .maybeSingle<{
      summary: string;
      strengths: string[] | null;
      weaknesses: string[] | null;
      recommendations: string[] | null;
      teacher_comment: string | null;
    }>();

  const teacherComment = input.teacherFeedback || `${input.studentName} completed ${input.taskTitle} with ${input.score}%.`;
  const summary = `${input.studentName} reviewed ${input.taskTitle} (${input.schoolGrade}, CEFR ${input.cefrLevel}) with ${input.score}% showing ${scoreBand}. Latest focus: ${weaknesses[0] ?? input.skillDomain}.`;

  const { error } = await supabase.from("parent_reports").upsert(
    {
      student_id: input.studentId,
      month,
      summary,
      strengths: uniqueList([...(existingReport?.strengths ?? []), ...strengths]),
      weaknesses: uniqueList([...(existingReport?.weaknesses ?? []), ...weaknesses]),
      recommendations: uniqueList([
        ...(existingReport?.recommendations ?? []),
        ...recommendations,
      ]),
      teacher_comment: teacherComment,
      generated_at: input.reviewedAt,
    },
    { onConflict: "student_id,month" },
  );

  return error;
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
    .select("id,teacher_id,title,school_grade,cefr_level,skill_domain")
    .eq("id", taskId)
    .maybeSingle<{
      id: string;
      teacher_id: string;
      title: string;
      school_grade: string | null;
      cefr_level: string | null;
      skill_domain: string | null;
    }>();

  if (taskError || !task || task.teacher_id !== profile.id) {
    return { ok: false, message: "You can only review tasks assigned by you." };
  }

  const { data: submission, error: submissionError } = await supabase
    .from("task_submissions")
    .select("id,task_id,student_id,status,score")
    .eq("id", submissionId)
    .maybeSingle<{
      id: string;
      task_id: string;
      student_id: string;
      status: string;
      score: number | null;
    }>();

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

  const { data: studentForReport } = await supabase
    .from("student_profiles")
    .select("id,user_id,school_grade")
    .eq("id", studentId)
    .maybeSingle<{ id: string; user_id: string; school_grade: string }>();

  const { data: studentProfileForReport } = studentForReport?.user_id
    ? await supabase
        .from("profiles")
        .select("name")
        .eq("id", studentForReport.user_id)
        .maybeSingle<{ name: string }>()
    : { data: null };

  const reportError = await upsertParentReportProgress({
    studentId,
    studentName: studentProfileForReport?.name ?? "Student",
    taskTitle: task.title,
    skillDomain: task.skill_domain ?? "English",
    cefrLevel: task.cefr_level ?? "A1",
    schoolGrade: task.school_grade ?? studentForReport?.school_grade ?? "Year 4",
    score: Math.round(Number(submission.score ?? 0)),
    weakSkills,
    teacherFeedback,
    reviewedAt,
  });

  if (reportError) {
    return {
      ok: false,
      message: `Review was saved, but parent report failed to update: ${reportError.message}`,
    };
  }

  revalidatePath("/teacher");
  revalidatePath("/teacher/reviews");
  revalidatePath("/parent");
  revalidatePath("/parent/report");

  return {
    ok: true,
    message: existingReward
      ? "Review saved. Reward was already issued before, so XP and coins were not duplicated. Parent report was refreshed."
      : "Review approved. Reward, weak skills, student totals, pet XP, and parent report were updated.",
  };
}
