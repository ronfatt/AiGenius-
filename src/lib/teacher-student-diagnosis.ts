import { getCefrTargetForGrade } from "./cefr-level";
import { getSupabaseServiceRoleClient, isSupabaseConfigured } from "./supabase";
import type { AuthProfile } from "./auth";
import type {
  LearningTask,
  Pet,
  PetRarity,
  PetStage,
  StudentProfile,
  StudentTaskSubmission,
  SubjectSkill,
} from "./types";

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

type DbProfile = {
  id: string;
  name: string;
  email: string;
};

type DbSubjectSkill = {
  id: string;
  student_id: string;
  subject: string;
  skill_name: string;
  level: number;
  mastery_percentage: number;
  weakness_tag: string | null;
  last_assessed_at: string | null;
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

type DbTask = {
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

type DbPet = {
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

type DbTeacherStudentLink = {
  student_id: string;
  teacher_id: string;
  status: string;
};

type DbClassroomStudent = {
  classroom_id: string;
  student_id: string;
};

type DbClassroom = {
  id: string;
  teacher_id: string;
};

type DbReward = {
  id: string;
  xp_amount: number;
  coin_amount: number;
  reason: string;
  created_at: string;
};

export type TeacherStudentDiagnosis = {
  student: StudentProfile;
  studentName: string;
  studentEmail: string;
  pet: Pet | null;
  cefrTarget: string;
  skills: SubjectSkill[];
  submissions: StudentTaskSubmission[];
  tasksById: Record<string, LearningTask>;
  recentRewards: DbReward[];
  live: true;
};

function toStudentProfile(row: DbStudentProfile): StudentProfile {
  return {
    id: row.id,
    userId: row.user_id,
    parentIds: row.parent_ids ?? [],
    referralCode: row.referral_code ?? "",
    schoolGrade: row.school_grade,
    actualLearningLevel: `Level ${row.actual_learning_level}`,
    targetLearningLevel: `Level ${row.target_learning_level}`,
    subjects: row.subjects ?? ["English"],
    petId: row.pet_id ?? "",
    totalXP: row.total_xp,
    starCoins: row.star_coins,
    streakDays: row.streak_days,
    attendanceRate: Math.round(Number(row.attendance_rate)),
    homeworkCompletionRate: Math.round(Number(row.homework_completion_rate)),
  };
}

function toSubjectSkill(row: DbSubjectSkill): SubjectSkill {
  return {
    id: row.id,
    studentId: row.student_id,
    subject: row.subject,
    skillName: row.skill_name,
    level: Math.round(Number(row.level)),
    masteryPercentage: Math.round(Number(row.mastery_percentage)),
    weaknessTag: row.weakness_tag ?? row.skill_name,
    lastAssessedAt: row.last_assessed_at ?? new Date().toISOString(),
  };
}

function toSubmission(row: DbSubmission): StudentTaskSubmission {
  return {
    id: row.id,
    taskId: row.task_id,
    studentId: row.student_id,
    score: Math.round(Number(row.score ?? 0)),
    status: row.status,
    teacherFeedback: row.teacher_feedback ?? "",
    autoFeedback: row.auto_feedback ?? "",
    submittedAt: row.submitted_at,
    reviewedAt: row.reviewed_at,
  };
}

function toTask(row: DbTask): LearningTask {
  return {
    id: row.id,
    classId: row.class_id,
    teacherId: row.teacher_id,
    title: row.title,
    description: row.description,
    subject: row.subject,
    schoolGrade: row.school_grade ?? "Year 4",
    cefrLevel: row.cefr_level ?? "A1",
    skillDomain: row.skill_domain ?? "Reading",
    skillTags: row.skill_tags ?? [],
    difficultyLevel: row.difficulty_level,
    taskBand:
      row.task_band ??
      (row.difficulty_level >= 4
        ? "Challenge"
        : row.difficulty_level <= 2
          ? "Foundation"
          : "Standard"),
    questions: [],
    dueDate: row.due_date ?? new Date().toISOString(),
    xpReward: row.xp_reward,
    coinReward: row.coin_reward,
    status: row.status,
  };
}

function toPet(row: DbPet): Pet {
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
    imageUrl: row.image_url ?? "/pets/pet01.png",
  };
}

async function canViewStudent(profile: AuthProfile, studentId: string) {
  if (profile.role === "admin") return true;
  if (profile.role !== "teacher") return false;

  const supabase = getSupabaseServiceRoleClient();
  const { data: monitorLink } = await supabase
    .from("teacher_student_links")
    .select("teacher_id,student_id,status")
    .eq("teacher_id", profile.id)
    .eq("student_id", studentId)
    .eq("status", "active")
    .maybeSingle<DbTeacherStudentLink>();

  if (monitorLink) return true;

  const { data: classroomLinks } = await supabase
    .from("classroom_students")
    .select("classroom_id,student_id")
    .eq("student_id", studentId)
    .returns<DbClassroomStudent[]>();
  const classroomIds = (classroomLinks ?? []).map((link) => link.classroom_id);
  if (!classroomIds.length) return false;

  const { data: classrooms } = await supabase
    .from("classrooms")
    .select("id,teacher_id")
    .in("id", classroomIds)
    .eq("teacher_id", profile.id)
    .returns<DbClassroom[]>();

  return Boolean(classrooms?.length);
}

export async function getTeacherStudentDiagnosisFromSupabase(
  profile: AuthProfile,
  studentId: string,
): Promise<TeacherStudentDiagnosis | null> {
  if (!isSupabaseConfigured() || !process.env.SUPABASE_SERVICE_ROLE_KEY) return null;

  const allowed = await canViewStudent(profile, studentId);
  if (!allowed) return null;

  const supabase = getSupabaseServiceRoleClient();
  const { data: studentRow } = await supabase
    .from("student_profiles")
    .select("id,user_id,parent_ids,referral_code,school_grade,actual_learning_level,target_learning_level,subjects,pet_id,total_xp,star_coins,streak_days,attendance_rate,homework_completion_rate")
    .eq("id", studentId)
    .maybeSingle<DbStudentProfile>();

  if (!studentRow) return null;

  const [profileResult, skillsResult, submissionsResult, petResult, rewardsResult] = await Promise.all([
    supabase
      .from("profiles")
      .select("id,name,email")
      .eq("id", studentRow.user_id)
      .maybeSingle<DbProfile>(),
    supabase
      .from("subject_skills")
      .select("id,student_id,subject,skill_name,level,mastery_percentage,weakness_tag,last_assessed_at")
      .eq("student_id", studentId)
      .returns<DbSubjectSkill[]>(),
    supabase
      .from("task_submissions")
      .select("id,task_id,student_id,score,status,teacher_feedback,auto_feedback,submitted_at,reviewed_at")
      .eq("student_id", studentId)
      .order("submitted_at", { ascending: false })
      .limit(8)
      .returns<DbSubmission[]>(),
    supabase
      .from("pets")
      .select("id,student_id,name,species,rarity,stage,level,xp,power,wisdom,speed,focus,courage,kindness,image_url")
      .eq("student_id", studentId)
      .maybeSingle<DbPet>(),
    supabase
      .from("reward_transactions")
      .select("id,xp_amount,coin_amount,reason,created_at")
      .eq("student_id", studentId)
      .order("created_at", { ascending: false })
      .limit(4)
      .returns<DbReward[]>(),
  ]);
  const taskIds = [...new Set((submissionsResult.data ?? []).map((submission) => submission.task_id))];
  const { data: tasks } = taskIds.length
    ? await supabase
        .from("learning_tasks")
        .select("id,class_id,teacher_id,title,description,subject,school_grade,cefr_level,skill_domain,skill_tags,task_band,difficulty_level,due_date,xp_reward,coin_reward,status")
        .in("id", taskIds)
        .returns<DbTask[]>()
    : { data: [] as DbTask[] };

  return {
    student: toStudentProfile(studentRow),
    studentName: profileResult.data?.name ?? "Student",
    studentEmail: profileResult.data?.email ?? "",
    pet: petResult.data ? toPet(petResult.data) : null,
    cefrTarget: getCefrTargetForGrade(studentRow.school_grade),
    skills: (skillsResult.data ?? []).map(toSubjectSkill),
    submissions: (submissionsResult.data ?? []).map(toSubmission),
    tasksById: Object.fromEntries((tasks ?? []).map((task) => [task.id, toTask(task)])),
    recentRewards: rewardsResult.data ?? [],
    live: true,
  };
}
