import { getSupabaseServiceRoleClient, isSupabaseConfigured } from "./supabase";
import type { AuthProfile } from "./auth";
import type { Classroom, LearningTask, StudentProfile, User } from "./types";

type DbProfile = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "teacher" | "student" | "parent";
  avatar_url: string | null;
  profile_code: string | null;
  created_at: string;
};

type DbClassroom = {
  id: string;
  centre_id: string;
  teacher_id: string;
  name: string;
  subject: string;
  grade: string;
  schedule: string;
};

type DbClassroomStudent = {
  classroom_id: string;
  student_id: string;
};

type DbStudentProfile = {
  id: string;
  user_id: string;
  parent_ids: string[];
  referral_code: string | null;
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
  skill_tags: string[] | null;
  task_band: LearningTask["taskBand"] | null;
  difficulty_level: 1 | 2 | 3 | 4 | 5;
  due_date: string | null;
  xp_reward: number;
  coin_reward: number;
  status: LearningTask["status"];
};

type DbSubmission = {
  task_id: string;
  status: "pending" | "submitted" | "reviewed" | "late";
};

export type LiveWorkspaceData = {
  classes: Classroom[];
  students: StudentProfile[];
  studentNames: Record<string, string>;
  teachers: User[];
  tasks: LearningTask[];
  submissions: DbSubmission[];
  live: boolean;
};

function toUser(profile: DbProfile): User {
  return {
    id: profile.id,
    name: profile.name,
    email: profile.email,
    role: profile.role,
    avatarUrl: profile.avatar_url ?? "",
    profileCode: profile.profile_code ?? undefined,
    createdAt: profile.created_at,
  };
}

function toStudentProfile(profile: DbStudentProfile): StudentProfile {
  return {
    id: profile.id,
    userId: profile.user_id,
    parentIds: profile.parent_ids ?? [],
    referralCode: profile.referral_code ?? "",
    schoolGrade: profile.school_grade,
    actualLearningLevel: `Level ${profile.actual_learning_level}`,
    targetLearningLevel: `Level ${profile.target_learning_level}`,
    subjects: profile.subjects ?? ["English"],
    petId: profile.pet_id ?? "",
    totalXP: profile.total_xp,
    starCoins: profile.star_coins,
    streakDays: profile.streak_days,
    attendanceRate: Math.round(Number(profile.attendance_rate)),
    homeworkCompletionRate: Math.round(Number(profile.homework_completion_rate)),
  };
}

function toTask(task: DbLearningTask): LearningTask {
  return {
    id: task.id,
    classId: task.class_id,
    teacherId: task.teacher_id,
    title: task.title,
    description: task.description,
    subject: task.subject,
    schoolGrade: task.school_grade ?? "Year 4",
    cefrLevel: task.cefr_level ?? "A1",
    skillDomain: task.skill_domain ?? "Reading",
    skillTags: task.skill_tags ?? [],
    difficultyLevel: task.difficulty_level,
    taskBand:
      task.task_band ??
      (task.difficulty_level >= 4
        ? "Challenge"
        : task.difficulty_level <= 2
          ? "Foundation"
          : "Standard"),
    questions: [],
    dueDate: task.due_date ?? new Date().toISOString(),
    xpReward: task.xp_reward,
    coinReward: task.coin_reward,
    status: task.status,
  };
}

export async function getLiveWorkspaceData(profile: AuthProfile): Promise<LiveWorkspaceData | null> {
  if (!isSupabaseConfigured() || !process.env.SUPABASE_SERVICE_ROLE_KEY) return null;
  if (profile.role !== "teacher" && profile.role !== "admin") return null;

  const supabase = getSupabaseServiceRoleClient();
  const [
    profilesResult,
    classesResult,
    classStudentsResult,
    studentsResult,
    tasksResult,
    submissionsResult,
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("id,name,email,role,avatar_url,profile_code,created_at")
      .returns<DbProfile[]>(),
    supabase
      .from("classrooms")
      .select("id,centre_id,teacher_id,name,subject,grade,schedule")
      .returns<DbClassroom[]>(),
    supabase
      .from("classroom_students")
      .select("classroom_id,student_id")
      .returns<DbClassroomStudent[]>(),
    supabase
      .from("student_profiles")
      .select("id,user_id,parent_ids,referral_code,school_grade,actual_learning_level,target_learning_level,subjects,pet_id,total_xp,star_coins,streak_days,attendance_rate,homework_completion_rate")
      .returns<DbStudentProfile[]>(),
    supabase
      .from("learning_tasks")
      .select("id,class_id,teacher_id,title,description,subject,school_grade,cefr_level,skill_domain,skill_tags,task_band,difficulty_level,due_date,xp_reward,coin_reward,status")
      .returns<DbLearningTask[]>(),
    supabase
      .from("task_submissions")
      .select("task_id,status")
      .returns<DbSubmission[]>(),
  ]);

  if (profilesResult.error || classesResult.error || studentsResult.error || tasksResult.error) {
    return null;
  }

  const dbProfiles = profilesResult.data ?? [];
  const dbClasses = classesResult.data ?? [];
  const dbClassStudents = classStudentsResult.data ?? [];
  const dbStudents = studentsResult.data ?? [];
  const dbTasks = tasksResult.data ?? [];
  const classIdsForRole =
    profile.role === "admin"
      ? new Set(dbClasses.map((item) => item.id))
      : new Set(dbClasses.filter((item) => item.teacher_id === profile.id).map((item) => item.id));
  const studentIdsForRole = new Set(
    dbClassStudents
      .filter((item) => classIdsForRole.has(item.classroom_id))
      .map((item) => item.student_id),
  );
  const visibleClasses = dbClasses.filter((item) => classIdsForRole.has(item.id));
  const visibleStudents =
    profile.role === "admin"
      ? dbStudents
      : dbStudents.filter((item) => studentIdsForRole.has(item.id));
  const visibleTasks =
    profile.role === "admin"
      ? dbTasks
      : dbTasks.filter((item) => classIdsForRole.has(item.class_id));
  const studentIdsByClass = dbClassStudents.reduce<Record<string, string[]>>((result, link) => {
    result[link.classroom_id] = [...(result[link.classroom_id] ?? []), link.student_id];
    return result;
  }, {});
  const studentNames = Object.fromEntries(
    dbProfiles
      .filter((profileRow) => profileRow.role === "student")
      .map((profileRow) => [profileRow.id, profileRow.name]),
  );

  return {
    classes: visibleClasses.map((classroom) => ({
      id: classroom.id,
      centreId: classroom.centre_id,
      teacherId: classroom.teacher_id,
      name: classroom.name,
      subject: classroom.subject,
      grade: classroom.grade,
      schedule: classroom.schedule,
      studentIds: studentIdsByClass[classroom.id] ?? [],
    })),
    students: visibleStudents.map(toStudentProfile),
    studentNames,
    teachers: dbProfiles.filter((item) => item.role === "teacher").map(toUser),
    tasks: visibleTasks.map(toTask),
    submissions: submissionsResult.data ?? [],
    live: true,
  };
}
