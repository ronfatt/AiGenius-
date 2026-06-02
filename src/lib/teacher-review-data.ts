import { calculateReward } from "./rewards";
import { getSupabaseServiceRoleClient, isSupabaseConfigured } from "./supabase";
import {
  getStudentName,
  getStudentPet,
  getTaskTitle,
  getTeacherDashboard,
} from "./dashboard-data";
import { mapSupabaseTaskToLearningTask } from "./student-task-data";
import { students, taskSubmissions, tasks } from "./mock-data";
import type { LearningTask, StudentProfile, StudentTaskSubmission } from "./types";

export type ReviewQuestionResult = {
  id: string;
  type: string;
  prompt: string;
  studentAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  explanation: string;
  skillTag: string;
};

export type TeacherReviewItem = {
  submission: StudentTaskSubmission;
  task: LearningTask;
  student: StudentProfile;
  studentName: string;
  petName: string;
  questionResults: ReviewQuestionResult[];
  weakSkillTags: string[];
  suggestedComment: string;
  suggestedReward: {
    xp: number;
    starCoins: number;
    reason: string;
  };
  recommendedNextTask: string;
  persisted?: boolean;
};

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

type DbSubmission = {
  id: string;
  task_id: string;
  student_id: string;
  score: number | null;
  status: "pending" | "submitted" | "reviewed" | "late";
  teacher_feedback: string | null;
  auto_feedback: string | null;
  submitted_at: string | null;
  reviewed_at: string | null;
};

type DbStudentProfile = {
  id: string;
  user_id: string;
  parent_ids: string[];
  school_grade: string;
  actual_learning_level: number;
  target_learning_level: number;
  subjects: string[];
  pet_id: string | null;
  total_xp: number;
  star_coins: number;
  streak_days: number;
  attendance_rate: number;
  homework_completion_rate: number;
};

type DbProfile = {
  id: string;
  name: string;
};

type DbPet = {
  id: string;
  student_id: string;
  name: string;
};

function buildQuestionResults(task: LearningTask, score: number): ReviewQuestionResult[] {
  const correctTarget = Math.round((score / 100) * task.questions.length);

  return task.questions.map((question, index) => {
    const isCorrect = index < correctTarget;
    const fallbackWrongAnswer =
      question.options?.find((option) => option !== question.answer) ?? "No answer";

    return {
      id: question.id,
      type: question.type,
      prompt: question.prompt,
      studentAnswer: isCorrect ? question.answer : fallbackWrongAnswer,
      correctAnswer: question.answer,
      isCorrect,
      explanation: question.explanation,
      skillTag: task.skillTags[index % task.skillTags.length] ?? task.skillDomain,
    };
  });
}

function parseSubmittedAnswers(autoFeedback: string) {
  if (!autoFeedback) return {};

  try {
    const parsed = JSON.parse(autoFeedback) as { answers?: Record<string, string> };
    return parsed.answers ?? {};
  } catch {
    return {};
  }
}

function buildQuestionResultsFromSubmission(
  task: LearningTask,
  submission: StudentTaskSubmission,
): ReviewQuestionResult[] {
  const submittedAnswers = parseSubmittedAnswers(submission.autoFeedback);

  if (!Object.keys(submittedAnswers).length) {
    return buildQuestionResults(task, submission.score);
  }

  return task.questions.map((question, index) => {
    const studentAnswer = submittedAnswers[question.id] ?? "No answer";
    const isCorrect = studentAnswer === question.answer;

    return {
      id: question.id,
      type: question.type,
      prompt: question.prompt,
      studentAnswer,
      correctAnswer: question.answer,
      isCorrect,
      explanation: question.explanation,
      skillTag: task.skillTags[index % task.skillTags.length] ?? task.skillDomain,
    };
  });
}

function getSuggestedComment(item: {
  score: number;
  studentName: string;
  weakSkillTags: string[];
}) {
  if (item.score >= 85) {
    return `${item.studentName} showed strong understanding. Give one challenge task next to stretch confidence.`;
  }

  if (item.score >= 70) {
    return `${item.studentName} is progressing well. Review ${item.weakSkillTags[0] ?? "the missed skill"} once, then continue standard practice.`;
  }

  return `${item.studentName} needs foundation support. Re-teach ${item.weakSkillTags[0] ?? "the target skill"} with examples before the next quest.`;
}

function toStudentProfile(student: DbStudentProfile): StudentProfile {
  return {
    id: student.id,
    userId: student.user_id,
    parentIds: student.parent_ids ?? [],
    referralCode: "",
    schoolGrade: student.school_grade,
    actualLearningLevel: `Level ${student.actual_learning_level}`,
    targetLearningLevel: `Level ${student.target_learning_level}`,
    subjects: student.subjects ?? ["English"],
    petId: student.pet_id ?? "",
    totalXP: student.total_xp,
    starCoins: student.star_coins,
    streakDays: student.streak_days,
    attendanceRate: student.attendance_rate,
    homeworkCompletionRate: student.homework_completion_rate,
  };
}

function toSubmission(submission: DbSubmission): StudentTaskSubmission {
  return {
    id: submission.id,
    taskId: submission.task_id,
    studentId: submission.student_id,
    score: Math.round(Number(submission.score ?? 0)),
    status: submission.status,
    teacherFeedback: submission.teacher_feedback ?? "",
    autoFeedback: submission.auto_feedback ?? "",
    submittedAt: submission.submitted_at,
    reviewedAt: submission.reviewed_at,
  };
}

function buildReviewItem(input: {
  submission: StudentTaskSubmission;
  task: LearningTask;
  student: StudentProfile;
  studentName: string;
  petName: string;
  persisted?: boolean;
}): TeacherReviewItem {
  const questionResults = buildQuestionResultsFromSubmission(input.task, input.submission);
  const weakSkillTags = questionResults
    .filter((result) => !result.isCorrect)
    .map((result) => result.skillTag);
  const reward = calculateReward({
    studentId: input.student.id,
    eventType: input.submission.score >= 80 ? "score_above_80" : "complete_normal_task",
    task: input.task,
    submission: input.submission,
  });

  return {
    submission: input.submission,
    task: input.task,
    student: input.student,
    studentName: input.studentName,
    petName: input.petName,
    questionResults,
    weakSkillTags,
    suggestedComment: getSuggestedComment({
      score: input.submission.score,
      studentName: input.studentName,
      weakSkillTags,
    }),
    suggestedReward: {
      xp: reward.xp,
      starCoins: reward.starCoins,
      reason: reward.reason,
    },
    recommendedNextTask:
      input.submission.score >= 85
        ? "Challenge reading and writing extension"
        : input.submission.score >= 70
          ? `Standard practice for ${weakSkillTags[0] ?? input.task.skillDomain}`
          : `Foundation review for ${weakSkillTags[0] ?? input.task.skillDomain}`,
    persisted: input.persisted,
  };
}

export function getTeacherReviewQueue(teacherId = "user_teacher_1"): TeacherReviewItem[] {
  const dashboard = getTeacherDashboard(teacherId);
  const teacherTaskIds = new Set(dashboard.tasks.map((task) => task.id));
  const submissions = taskSubmissions as StudentTaskSubmission[];

  return submissions
    .filter(
      (submission) =>
        teacherTaskIds.has(submission.taskId) &&
        (submission.status === "submitted" || submission.status === "reviewed"),
    )
    .map((submission) => {
      const task = tasks.find((item) => item.id === submission.taskId) ?? tasks[0];
      const student = students.find((item) => item.id === submission.studentId) ?? students[0];
      return buildReviewItem({
        submission,
        task,
        student,
        studentName: getStudentName(student),
        petName: getStudentPet(student).name,
      });
    })
    .sort((a, b) => {
      if (a.submission.status !== b.submission.status) {
        return a.submission.status === "submitted" ? -1 : 1;
      }

      return a.submission.score - b.submission.score;
    });
}

export async function getTeacherReviewQueueFromSupabase(teacherId: string) {
  if (!isSupabaseConfigured() || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return [];
  }

  const supabase = getSupabaseServiceRoleClient();
  const { data: dbTasks, error: taskError } = await supabase
    .from("learning_tasks")
    .select("id,class_id,teacher_id,title,description,subject,school_grade,cefr_level,skill_domain,skill_tags,task_band,questions,difficulty_level,due_date,xp_reward,coin_reward,status")
    .eq("teacher_id", teacherId)
    .returns<DbLearningTask[]>();

  if (taskError || !dbTasks?.length) return [];

  const tasksById = new Map(
    dbTasks.map((task) => [task.id, mapSupabaseTaskToLearningTask(task)]),
  );
  const { data: dbSubmissions, error: submissionError } = await supabase
    .from("task_submissions")
    .select("id,task_id,student_id,score,status,teacher_feedback,auto_feedback,submitted_at,reviewed_at")
    .in("task_id", [...tasksById.keys()])
    .in("status", ["submitted", "reviewed"])
    .returns<DbSubmission[]>();

  if (submissionError || !dbSubmissions?.length) return [];

  const studentIds = [...new Set(dbSubmissions.map((submission) => submission.student_id))];
  const { data: dbStudents } = await supabase
    .from("student_profiles")
    .select("id,user_id,parent_ids,school_grade,actual_learning_level,target_learning_level,subjects,pet_id,total_xp,star_coins,streak_days,attendance_rate,homework_completion_rate")
    .in("id", studentIds)
    .returns<DbStudentProfile[]>();

  const userIds = [...new Set((dbStudents ?? []).map((student) => student.user_id))];
  const { data: dbProfiles } = await supabase
    .from("profiles")
    .select("id,name")
    .in("id", userIds)
    .returns<DbProfile[]>();

  const { data: dbPets } = await supabase
    .from("pets")
    .select("id,student_id,name")
    .in("student_id", studentIds)
    .returns<DbPet[]>();

  const studentsById = new Map((dbStudents ?? []).map((student) => [student.id, toStudentProfile(student)]));
  const namesByUserId = new Map((dbProfiles ?? []).map((profile) => [profile.id, profile.name]));
  const petsByStudentId = new Map((dbPets ?? []).map((pet) => [pet.student_id, pet.name]));

  return dbSubmissions
    .map((dbSubmission) => {
      const task = tasksById.get(dbSubmission.task_id);
      const student = studentsById.get(dbSubmission.student_id);
      if (!task || !student) return null;

      const submission = toSubmission(dbSubmission);
      return buildReviewItem({
        submission,
        task,
        student,
        studentName: namesByUserId.get(student.userId) ?? "Student",
        petName: petsByStudentId.get(student.id) ?? "Main Pet",
        persisted: true,
      });
    })
    .filter((item): item is TeacherReviewItem => Boolean(item))
    .sort((a, b) => {
      if (a.submission.status !== b.submission.status) {
        return a.submission.status === "submitted" ? -1 : 1;
      }

      return a.submission.score - b.submission.score;
    });
}

export function getReviewTaskTitle(taskId: string) {
  return getTaskTitle(taskId);
}
