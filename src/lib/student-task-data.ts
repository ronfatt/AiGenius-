import { getSupabaseServiceRoleClient, isSupabaseConfigured } from "./supabase";
import type { EnglishQuestionType, EnglishTaskQuestion, LearningTask } from "./types";

type DbLearningTask = {
  id: string;
  class_id: string;
  teacher_id: string;
  title: string;
  description: string;
  subject: string;
  school_grade: string | null;
  cefr_level: LearningTask["cefrLevel"] | null;
  skill_domain: LearningTask["skillDomain"] | null;
  skill_tags: string[];
  task_band: LearningTask["taskBand"] | null;
  questions: unknown;
  difficulty_level: 1 | 2 | 3 | 4 | 5;
  due_date: string | null;
  xp_reward: number;
  coin_reward: number;
  status: string;
};

type DbStudentProfile = {
  id: string;
  school_grade: string;
  actual_learning_level: number;
  target_learning_level: number;
};

type DbClassroomStudent = {
  classroom_id: string;
};

function inferSkillDomain(skillTags: string[]): LearningTask["skillDomain"] {
  const text = skillTags.join(" ").toLowerCase();

  if (text.includes("grammar") || text.includes("tense") || text.includes("verb")) return "Grammar";
  if (text.includes("vocab") || text.includes("word") || text.includes("synonym")) return "Vocabulary";
  if (text.includes("writing") || text.includes("sentence")) return "Writing";
  if (text.includes("speaking") || text.includes("oral")) return "Speaking";
  if (text.includes("listening") || text.includes("instruction")) return "Listening";
  return "Reading";
}

function inferCefr(schoolGrade: string): LearningTask["cefrLevel"] {
  if (schoolGrade.includes("1") || schoolGrade.includes("2")) return "Pre-A1";
  if (schoolGrade.includes("3") || schoolGrade.includes("4")) return "A1";
  if (schoolGrade.includes("5")) return "A2";
  return "B1";
}

function getTaskBand(difficultyLevel: number): LearningTask["taskBand"] {
  if (difficultyLevel <= 2) return "Foundation";
  if (difficultyLevel >= 4) return "Challenge";
  return "Standard";
}

function normalizeQuestionType(type: unknown, fallback: EnglishQuestionType): EnglishQuestionType {
  const value = String(type ?? "");
  const allowed: EnglishQuestionType[] = [
    "reading",
    "grammar",
    "vocabulary",
    "writing",
    "speaking",
    "listening",
  ];

  return allowed.includes(value as EnglishQuestionType) ? (value as EnglishQuestionType) : fallback;
}

function parseQuestions(task: DbLearningTask, skillTags: string[]): EnglishTaskQuestion[] {
  if (!Array.isArray(task.questions) || task.questions.length === 0) {
    return [];
  }

  const parsedQuestions: EnglishTaskQuestion[] = [];

  task.questions.forEach((question, index) => {
    if (!question || typeof question !== "object") return;
    const item = question as Record<string, unknown>;
    const prompt = String(item.prompt ?? "").trim();
    const answer = String(item.answer ?? "").trim();
    const explanation = String(item.explanation ?? "").trim();

    if (!prompt || !answer) return;

    const fallbackTypes: EnglishQuestionType[] = ["reading", "grammar", "vocabulary"];
    const options = Array.isArray(item.options)
      ? item.options.map((option) => String(option)).filter(Boolean)
      : undefined;

    parsedQuestions.push({
      id: String(item.id ?? `${task.id}_question_${index + 1}`),
      type: normalizeQuestionType(item.type, fallbackTypes[index % fallbackTypes.length]),
      prompt,
      options: options?.length ? options : [answer, skillTags[0] ?? "main idea", "not enough information"],
      answer,
      explanation: explanation || "Review the teacher explanation and try the skill again.",
    });
  });

  return parsedQuestions;
}

export function mapSupabaseTaskToLearningTask(
  task: DbLearningTask,
  student?: DbStudentProfile | null,
): LearningTask {
  const skillTags = task.skill_tags?.length ? task.skill_tags : ["main idea", "details"];
  const skillDomain = task.skill_domain ?? inferSkillDomain(skillTags);
  const schoolGrade = task.school_grade ?? student?.school_grade ?? "Year 4";
  const cefrLevel = task.cefr_level ?? inferCefr(schoolGrade);
  const parsedQuestions = parseQuestions(task, skillTags);

  return {
    id: task.id,
    classId: task.class_id,
    teacherId: task.teacher_id,
    title: task.title,
    description: task.description,
    subject: task.subject,
    schoolGrade,
    cefrLevel,
    skillDomain,
    skillTags,
    difficultyLevel: task.difficulty_level,
    taskBand: task.task_band ?? getTaskBand(task.difficulty_level),
    questions: parsedQuestions.length ? parsedQuestions : [
      {
        id: `${task.id}_reading`,
        type: "reading",
        prompt: `Read the task description. What is the main learning focus of this quest?`,
        options: [skillTags[0] ?? "main idea", "unrelated topic", "random sentence", "only spelling"],
        answer: skillTags[0] ?? "main idea",
        explanation: "The main focus is taken from the teacher's skill tag for this English quest.",
      },
      {
        id: `${task.id}_grammar`,
        type: "grammar",
        prompt: "Choose the sentence that sounds most complete.",
        options: ["She goes to class.", "She go class.", "She going class.", "She gone class."],
        answer: "She goes to class.",
        explanation: "A complete sentence needs correct subject-verb agreement.",
      },
      {
        id: `${task.id}_vocabulary`,
        type: "vocabulary",
        prompt: `Which word is closest to the quest skill: ${skillTags[0] ?? "reading"}?`,
        options: [skillTags[1] ?? "details", "noise", "number", "colour"],
        answer: skillTags[1] ?? "details",
        explanation: "Vocabulary practice connects the task focus to a related English skill.",
      },
    ],
    dueDate: task.due_date ?? new Date().toISOString(),
    xpReward: task.xp_reward,
    coinReward: task.coin_reward,
    status: task.status === "reviewed" ? "reviewed" : task.status === "submitted" ? "submitted" : "assigned",
  };
}

export async function getStudentProfileForUser(userId: string) {
  if (!isSupabaseConfigured() || !process.env.SUPABASE_SERVICE_ROLE_KEY) return null;

  const supabase = getSupabaseServiceRoleClient();
  const { data } = await supabase
    .from("student_profiles")
    .select("id,school_grade,actual_learning_level,target_learning_level")
    .eq("user_id", userId)
    .maybeSingle<DbStudentProfile>();

  return data ?? null;
}

export async function getStudentTasksFromSupabase(userId: string) {
  const student = await getStudentProfileForUser(userId);
  if (!student) return [];

  const supabase = getSupabaseServiceRoleClient();
  const { data: classroomLinks } = await supabase
    .from("classroom_students")
    .select("classroom_id")
    .eq("student_id", student.id)
    .returns<DbClassroomStudent[]>();

  const classroomIds = classroomLinks?.map((link) => link.classroom_id) ?? [];
  if (!classroomIds.length) return [];

  const { data: tasks } = await supabase
    .from("learning_tasks")
    .select("id,class_id,teacher_id,title,description,subject,school_grade,cefr_level,skill_domain,skill_tags,task_band,questions,difficulty_level,due_date,xp_reward,coin_reward,status")
    .in("class_id", classroomIds)
    .in("status", ["assigned", "submitted", "reviewed"])
    .order("due_date", { ascending: true })
    .returns<DbLearningTask[]>();

  return (tasks ?? []).map((task) => mapSupabaseTaskToLearningTask(task, student));
}

export async function getStudentTaskFromSupabase(userId: string, taskId: string) {
  const student = await getStudentProfileForUser(userId);
  if (!student) return null;

  const supabase = getSupabaseServiceRoleClient();
  const { data: task } = await supabase
    .from("learning_tasks")
    .select("id,class_id,teacher_id,title,description,subject,school_grade,cefr_level,skill_domain,skill_tags,task_band,questions,difficulty_level,due_date,xp_reward,coin_reward,status")
    .eq("id", taskId)
    .maybeSingle<DbLearningTask>();

  if (!task) return null;

  const { data: classroomLink } = await supabase
    .from("classroom_students")
    .select("classroom_id")
    .eq("student_id", student.id)
    .eq("classroom_id", task.class_id)
    .maybeSingle<DbClassroomStudent>();

  if (!classroomLink) return null;

  return {
    task: mapSupabaseTaskToLearningTask(task, student),
    studentId: student.id,
  };
}
