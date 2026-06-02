"use server";

import { revalidatePath } from "next/cache";
import { getCurrentProfile } from "@/lib/auth";
import { getSupabaseServiceRoleClient } from "@/lib/supabase";
import { getStudentTaskFromSupabase } from "@/lib/student-task-data";

type SubmitTaskState = {
  ok: boolean;
  message: string;
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
  const autoFeedback = {
    score,
    answers,
    submittedAt,
    message:
      score >= 85
        ? "Strong work. Ready for challenge practice."
        : score >= 60
          ? "Good progress. Review missed questions before the next quest."
          : "Foundation support recommended before moving forward.",
  };

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
    message: "Quest submitted. Your teacher can now review it and approve rewards.",
  };
}
