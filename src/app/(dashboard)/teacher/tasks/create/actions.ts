"use server";

import { revalidatePath } from "next/cache";
import { getCurrentProfile } from "@/lib/auth";
import { getSupabaseServiceRoleClient } from "@/lib/supabase";
import type { GeneratedEnglishTask } from "@/lib/english-task-generator";
import type { EnglishTaskQuestion } from "@/lib/types";

export type PublishTaskState = {
  ok: boolean;
  message: string;
  taskId?: string;
};

type SupabaseError = {
  message: string;
};

type PublishQueryBuilder = {
  select: (columns: string) => PublishQueryBuilder;
  eq: (column: string, value: unknown) => PublishQueryBuilder;
  maybeSingle: <T>() => Promise<{ data: T | null; error: SupabaseError | null }>;
  insert: (
    values: Record<string, unknown>,
  ) => { select: (columns: string) => PublishQueryBuilder };
};

type PublishSupabaseClient = {
  from: (table: string) => PublishQueryBuilder;
};

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function parseTask(value: FormDataEntryValue | null) {
  if (!value) return null;

  try {
    const parsed = JSON.parse(String(value)) as Partial<GeneratedEnglishTask>;

    if (!parsed.title || !parsed.description || !parsed.skillTags?.length) {
      return null;
    }

    return parsed as GeneratedEnglishTask;
  } catch {
    return null;
  }
}

function buildTaskQuestions(task: GeneratedEnglishTask): EnglishTaskQuestion[] {
  return [
    {
      id: "reading",
      type: "reading",
      prompt: `${task.readingPassage}\n\n${task.readingQuestion}`,
      options: task.options,
      answer: task.answers.reading,
      explanation: task.feedback.reading,
    },
    {
      id: "grammar",
      type: "grammar",
      prompt: task.grammarQuestion,
      options: [
        task.answers.grammar,
        "She explain the word to her partner.",
        "She explaining the word.",
        "She explained every day.",
      ],
      answer: task.answers.grammar,
      explanation: task.feedback.grammar,
    },
    {
      id: "vocabulary",
      type: "vocabulary",
      prompt: task.vocabularyQuestion,
      options: [task.answers.vocabulary, "hide", "forget", "make noisy"],
      answer: task.answers.vocabulary,
      explanation: task.feedback.vocabulary,
    },
  ];
}

export async function publishTeacherTaskAction(
  _previousState: PublishTaskState,
  formData: FormData,
): Promise<PublishTaskState> {
  const profile = await getCurrentProfile();

  if (!profile || profile.role !== "teacher") {
    return { ok: false, message: "Please login as a teacher first." };
  }

  const classId = String(formData.get("classId") ?? "");
  const task = parseTask(formData.get("task"));

  if (!uuidPattern.test(classId)) {
    return {
      ok: false,
      message: "Demo class selected. Choose a real Supabase class UUID to publish.",
    };
  }

  if (!task) {
    return { ok: false, message: "Generate or preview a valid English task first." };
  }

  const supabase = getSupabaseServiceRoleClient() as unknown as PublishSupabaseClient;
  const { data: classroom, error: classError } = await supabase
    .from("classrooms")
    .select("id,teacher_id")
    .eq("id", classId)
    .maybeSingle<{ id: string; teacher_id: string }>();

  if (classError || !classroom || classroom.teacher_id !== profile.id) {
    return { ok: false, message: "You can only publish tasks to your own classes." };
  }

  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 7);
  const questions = buildTaskQuestions(task);

  const { data: insertedTask, error } = await supabase
    .from("learning_tasks")
    .insert({
      class_id: classId,
      teacher_id: profile.id,
      title: task.title,
      description: task.description,
      subject: "English",
      school_grade: task.schoolGrade,
      cefr_level: task.cefrLevel,
      skill_domain: task.skillDomain,
      skill_tags: task.skillTags,
      task_band: task.taskBand,
      questions,
      content: {
        readingPassage: task.readingPassage,
        readingQuestion: task.readingQuestion,
        grammarQuestion: task.grammarQuestion,
        vocabularyQuestion: task.vocabularyQuestion,
        options: task.options,
        answers: task.answers,
        feedback: task.feedback,
      },
      difficulty_level: task.difficultyLevel,
      due_date: dueDate.toISOString(),
      xp_reward: task.xpReward,
      coin_reward: task.coinReward,
      status: "assigned",
    })
    .select("id")
    .maybeSingle<{ id: string }>();

  if (error || !insertedTask) {
    return { ok: false, message: error?.message ?? "Unable to publish task." };
  }

  revalidatePath("/teacher");
  revalidatePath("/teacher/tasks/create");
  revalidatePath("/student/tasks");

  return {
    ok: true,
    taskId: insertedTask.id,
    message: "Task published to Supabase. Students in this class can now see it.",
  };
}
