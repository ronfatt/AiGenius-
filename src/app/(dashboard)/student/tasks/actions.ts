"use server";

import { revalidatePath } from "next/cache";
import { getCurrentProfile } from "@/lib/auth";
import { getEvolutionProgress } from "@/lib/pet-system";
import { calculateReward } from "@/lib/rewards";
import { getSupabaseServiceRoleClient } from "@/lib/supabase";
import { getStudentTaskFromSupabase } from "@/lib/student-task-data";

type SubmitTaskState = {
  ok: boolean;
  message: string;
  rewardPreview?: {
    score: number;
    xp: number;
    starCoins: number;
    reason: string;
    status: "pending_teacher_approval";
    recommendedNextTask: string;
    weakSkills: string[];
    masteredSkills: string[];
    petEvolutionProgress?: number;
  };
};

type SupabaseError = {
  message: string;
};

type StudentTaskMutationBuilder = {
  select: (columns: string) => StudentTaskMutationBuilder;
  eq: (column: string, value: unknown) => StudentTaskMutationBuilder;
  maybeSingle: <T>() => Promise<{ data: T | null; error: SupabaseError | null }>;
  upsert: (
    values: Record<string, unknown>,
    options?: Record<string, unknown>,
  ) => Promise<{ error: SupabaseError | null }>;
};

type StudentTaskSupabaseClient = {
  from: (table: string) => StudentTaskMutationBuilder;
};

type DbPetPreview = {
  xp: number;
  level: number;
  stage: "baby" | "junior" | "advanced" | "legendary";
};

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function parseAnswers(value: FormDataEntryValue | null) {
  if (!value) return {};

  try {
    const parsed = JSON.parse(String(value));
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    return Object.fromEntries(
      Object.entries(parsed).map(([key, answer]) => [key, String(answer)]),
    );
  } catch {
    return {};
  }
}

function parseScore(value: FormDataEntryValue | null) {
  const parsed = Number(value ?? 0);
  if (!Number.isFinite(parsed)) return 0;
  return Math.max(0, Math.min(100, Math.round(parsed)));
}

function getScoreFeedback(score: number) {
  if (score >= 85) {
    return {
      message: "Strong work. Your teacher will check it and may approve challenge-level rewards.",
      recommendedNextTask: "Challenge task for the same English skill",
    };
  }

  if (score >= 60) {
    return {
      message: "Good progress. Review the missed questions before moving to the next quest.",
      recommendedNextTask: "Standard practice with correction review",
    };
  }

  return {
    message: "Foundation support recommended. Focus on the correction steps first.",
    recommendedNextTask: "Foundation review with guided examples",
  };
}

function getQuestionSkill(questionType: string, fallback: string) {
  const labels: Record<string, string> = {
    reading: "Reading",
    grammar: "Grammar",
    vocabulary: "Vocabulary",
    writing: "Writing",
    speaking: "Speaking",
    listening: "Listening",
  };

  return labels[questionType] ?? fallback;
}

export async function submitStudentTaskAction(
  _previousState: SubmitTaskState,
  formData: FormData,
): Promise<SubmitTaskState> {
  const profile = await getCurrentProfile();

  if (!profile || profile.role !== "student") {
    return { ok: false, message: "Please login as a student first." };
  }

  const taskId = String(formData.get("taskId") ?? "");

  if (!uuidPattern.test(taskId)) {
    return {
      ok: false,
      message: "Demo quest completed. Real Supabase submission needs a published task UUID.",
    };
  }

  const taskDetail = await getStudentTaskFromSupabase(profile.id, taskId);
  if (!taskDetail) {
    return { ok: false, message: "Task not found for this student." };
  }

  const score = parseScore(formData.get("score"));
  const answers = parseAnswers(formData.get("answers"));
  const submittedAt = new Date().toISOString();
  const supabase = getSupabaseServiceRoleClient() as unknown as StudentTaskSupabaseClient;
  const { data: existingSubmission } = await supabase
    .from("task_submissions")
    .select("id,status")
    .eq("task_id", taskId)
    .eq("student_id", taskDetail.studentId)
    .maybeSingle<{ id: string; status: string }>();

  if (existingSubmission?.status === "reviewed") {
    return {
      ok: false,
      message: "This quest has already been reviewed by your teacher.",
    };
  }

  const weakSkills = taskDetail.task.questions
    .filter((question) => answers[question.id] !== question.answer)
    .map((question) => getQuestionSkill(question.type, taskDetail.task.skillDomain));
  const masteredSkills = taskDetail.task.questions
    .filter((question) => answers[question.id] === question.answer)
    .map((question) => getQuestionSkill(question.type, taskDetail.task.skillDomain));
  const reward = calculateReward({
    studentId: taskDetail.studentId,
    eventType:
      taskDetail.task.taskBand === "Challenge"
        ? "challenge_task_completed"
        : score >= 80
          ? "score_above_80"
          : "complete_normal_task",
    task: taskDetail.task,
    submission: {
      id: existingSubmission?.id ?? "pending_submission",
      taskId,
      studentId: taskDetail.studentId,
      score,
      status: "submitted",
      teacherFeedback: "",
      autoFeedback: "",
      submittedAt,
      reviewedAt: null,
    },
  });
  const scoreFeedback = getScoreFeedback(score);
  const { data: petPreview } = await supabase
    .from("pets")
    .select("xp,level,stage")
    .eq("student_id", taskDetail.studentId)
    .maybeSingle<DbPetPreview>();
  const petEvolutionProgress =
    petPreview === null
      ? undefined
      : getEvolutionProgress({
          id: "preview",
          studentId: taskDetail.studentId,
          name: "Preview Pet",
          species: "Preview",
          rarity: "common",
          imageUrl: "",
          power: 0,
          wisdom: 0,
          speed: 0,
          focus: 0,
          courage: 0,
          kindness: 0,
          xp: Number(petPreview.xp) + reward.xp,
          level: Number(petPreview.level),
          stage: petPreview.stage,
        }).progressPercent;
  const autoFeedback = {
    score,
    answers,
    submittedAt,
    rewardPreview: {
      xp: reward.xp,
      starCoins: reward.starCoins,
      reason: reward.reason,
      status: "pending_teacher_approval",
    },
    weakSkills: [...new Set(weakSkills)],
    masteredSkills: [...new Set(masteredSkills)],
    recommendedNextTask: scoreFeedback.recommendedNextTask,
    petEvolutionProgress,
    message: scoreFeedback.message,
  };

  const { error } = await supabase.from("task_submissions").upsert(
    {
      id: existingSubmission?.id,
      task_id: taskId,
      student_id: taskDetail.studentId,
      score,
      status: "submitted",
      auto_feedback: JSON.stringify(autoFeedback),
      submitted_at: submittedAt,
      reviewed_at: null,
    },
    { onConflict: "task_id,student_id" },
  );

  if (error) {
    return { ok: false, message: error.message };
  }

  revalidatePath("/student/tasks");
  revalidatePath(`/student/tasks/${taskId}`);
  revalidatePath("/teacher/reviews");

  return {
    ok: true,
    message: "Quest submitted. Reward preview is ready and waiting for teacher approval.",
    rewardPreview: {
      score,
      xp: reward.xp,
      starCoins: reward.starCoins,
      reason: reward.reason,
      status: "pending_teacher_approval",
      recommendedNextTask: scoreFeedback.recommendedNextTask,
      weakSkills: [...new Set(weakSkills)],
      masteredSkills: [...new Set(masteredSkills)],
      petEvolutionProgress,
    },
  };
}
