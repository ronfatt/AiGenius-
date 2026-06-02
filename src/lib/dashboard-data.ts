import {
  battles,
  cards,
  classrooms,
  pets,
  reports,
  rewardTransactions,
  schoolTags,
  students,
  subjectSkills,
  taskSubmissions,
  tasks,
  users,
} from "./mock-data";
import type { Classroom, LearningTask, Pet, StudentProfile, User } from "./types";
import { getCefrTargetForGrade } from "./cefr-level";
import { getEnglishStandardsForGrade } from "./english-curriculum";
import { getSupabaseServiceRoleClient, isSupabaseConfigured } from "./supabase";

function average(values: number[]) {
  if (values.length === 0) return 0;
  return Math.round(values.reduce((total, value) => total + value, 0) / values.length);
}

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
  skill_tags: string[];
  difficulty_level: 1 | 2 | 3 | 4 | 5;
  due_date: string | null;
  xp_reward: number;
  coin_reward: number;
  status: LearningTask["status"];
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

type DbReward = {
  id: string;
  student_id: string;
  source_type: "task" | "behavior" | "quiz" | "battle" | "manual";
  source_id: string | null;
  xp_amount: number;
  coin_amount: number;
  reason: string;
  created_at: string;
};

type DbSchoolTag = {
  id: string;
  centre_id: string | null;
  name: string;
  code: string;
  area: string | null;
};

type DbProfileSchoolTag = {
  profile_id: string;
  school_tag_id: string;
  role: "admin" | "teacher" | "student" | "parent";
};

type DbParentReport = {
  id: string;
  student_id: string;
  month: string;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  teacher_comment: string | null;
  generated_at: string;
};

type DbTeacherStudentLink = {
  teacher_id: string;
  student_id: string;
  status: "active" | "pending" | "removed";
};

type DbPet = {
  id: string;
  student_id: string;
  name: string;
  species: Pet["species"];
  rarity: Pet["rarity"];
  stage: Pet["stage"];
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

type DbParentStudentLink = {
  parent_id: string;
  student_id: string;
  status: "active" | "pending" | "removed";
};

export function getUserName(userId: string) {
  return users.find((user) => user.id === userId)?.name ?? "Unknown user";
}

export function getStudentName(student: StudentProfile) {
  return getUserName(student.userId);
}

export function getStudentPet(student: StudentProfile) {
  return pets.find((pet) => pet.id === student.petId) ?? pets[0];
}

export function getStudentTasks(student: StudentProfile) {
  const enrolledClassIds = classrooms
    .filter((classroom) => classroom.studentIds.includes(student.id))
    .map((classroom) => classroom.id);

  return tasks.filter((task) => enrolledClassIds.includes(task.classId)).slice(0, 5);
}

export function getStudentDashboard(studentId = "student_1") {
  const student = students.find((item) => item.id === studentId) ?? students[0];
  const pet = getStudentPet(student);
  const studentTasks = getStudentTasks(student);
  const reviewedSubmissions = taskSubmissions.filter(
    (submission) => submission.studentId === student.id && submission.status === "reviewed",
  );
  const recentRewards = rewardTransactions
    .filter((reward) => reward.studentId === student.id)
    .slice(0, 4);

  return {
    student,
    studentName: getStudentName(student),
    pet,
    cefrTarget: getCefrTargetForGrade(student.schoolGrade),
    englishStandards: getEnglishStandardsForGrade(student.schoolGrade),
    tasks: studentTasks,
    completedTaskCount: reviewedSubmissions.length,
    skills: subjectSkills.filter((skill) => skill.studentId === student.id),
    report: reports.find((report) => report.studentId === student.id) ?? reports[0],
    recentRewards,
    cards: cards.slice(0, 3),
  };
}

export function getTeacherDashboard(teacherId = "user_teacher_1") {
  const teacher = users.find((user) => user.id === teacherId) as User | undefined;
  const teacherClasses = classrooms.filter((classroom) => classroom.teacherId === teacherId);
  const teacherStudentIds = new Set(teacherClasses.flatMap((classroom) => classroom.studentIds));
  const teacherStudents = students.filter((student) => teacherStudentIds.has(student.id));
  const teacherTasks = tasks.filter((task) => task.teacherId === teacherId);
  const weakStudents = [...teacherStudents]
    .filter(
      (student) =>
        student.homeworkCompletionRate < 82 || student.attendanceRate < 92,
    )
    .sort((a, b) => a.homeworkCompletionRate - b.homeworkCompletionRate);
  const topStudents = [...teacherStudents]
    .sort((a, b) => b.totalXP - a.totalXP)
    .slice(0, 4);
  const pendingSubmissions = taskSubmissions
    .filter((submission) =>
      teacherTasks.some((task) => task.id === submission.taskId) &&
      submission.status === "submitted",
    )
    .slice(0, 5);
  const subjectMastery = teacherClasses.map((classroom) => {
    const classroomStudents = teacherStudents.filter((student) =>
      classroom.studentIds.includes(student.id),
    );
    const masteryValues = subjectSkills
      .filter(
        (skill) =>
          skill.subject === classroom.subject &&
          classroomStudents.some((student) => student.id === skill.studentId),
      )
      .map((skill) => skill.masteryPercentage);

    return {
      subject: classroom.subject,
      mastery: average(masteryValues),
    };
  });

  return {
    teacher,
    classes: teacherClasses,
    students: teacherStudents,
    tasks: teacherTasks,
    weakStudents,
    topStudents,
    pendingSubmissions,
    subjectMastery,
    leaderboard: topStudents,
    studentNameByUserId: Object.fromEntries(users.map((user) => [user.id, user.name])),
    teacherNameById: Object.fromEntries(users.map((user) => [user.id, user.name])),
    taskTitleById: Object.fromEntries(tasks.map((task) => [task.id, task.title])),
    summary: {
      classCount: teacherClasses.length,
      studentCount: teacherStudents.length,
      homeworkCompletion: average(
        teacherStudents.map((student) => student.homeworkCompletionRate),
      ),
      attendance: average(teacherStudents.map((student) => student.attendanceRate)),
      coinsGiven: rewardTransactions
        .filter((reward) => teacherStudents.some((student) => student.id === reward.studentId))
        .reduce((total, reward) => total + reward.coinAmount, 0),
    },
  };
}

export async function getTeacherDashboardFromSupabase(teacherId: string) {
  if (!isSupabaseConfigured() || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return null;
  }

  try {
    const supabase = getSupabaseServiceRoleClient();
    const [
      teacherResult,
      classesResult,
      monitorLinksResult,
      tasksResult,
    ] = await Promise.all([
      supabase
        .from("profiles")
        .select("id,name,email,role,avatar_url,profile_code,created_at")
        .eq("id", teacherId)
        .maybeSingle<DbProfile>(),
      supabase
        .from("classrooms")
        .select("id,centre_id,teacher_id,name,subject,grade,schedule")
        .eq("teacher_id", teacherId)
        .returns<DbClassroom[]>(),
      supabase
        .from("teacher_student_links")
        .select("teacher_id,student_id,status")
        .eq("teacher_id", teacherId)
        .eq("status", "active")
        .returns<DbTeacherStudentLink[]>(),
      supabase
        .from("learning_tasks")
        .select("id,class_id,teacher_id,title,description,subject,skill_tags,difficulty_level,due_date,xp_reward,coin_reward,status")
        .eq("teacher_id", teacherId)
        .returns<DbLearningTask[]>(),
    ]);

    const teacher = teacherResult.data ? toUser(teacherResult.data) : undefined;
    const dbClasses = classesResult.data ?? [];
    const classIds = dbClasses.map((classroom) => classroom.id);
    const { data: classroomLinks } = classIds.length
      ? await supabase
          .from("classroom_students")
          .select("classroom_id,student_id")
          .in("classroom_id", classIds)
          .returns<DbClassroomStudent[]>()
      : { data: [] as DbClassroomStudent[] };
    const classStudentIds = (classroomLinks ?? []).map((link) => link.student_id);
    const monitorStudentIds = (monitorLinksResult.data ?? []).map((link) => link.student_id);
    const studentIds = [...new Set([...classStudentIds, ...monitorStudentIds])];
    const realTasks = (tasksResult.data ?? []).map(toLearningTask);
    const taskIds = realTasks.map((task) => task.id);
    const [
      studentsResult,
      submissionsResult,
      skillsResult,
      rewardsResult,
    ] = await Promise.all([
      studentIds.length
        ? supabase
            .from("student_profiles")
            .select("id,user_id,parent_ids,referral_code,school_grade,actual_learning_level,target_learning_level,subjects,pet_id,total_xp,star_coins,streak_days,attendance_rate,homework_completion_rate")
            .in("id", studentIds)
            .returns<DbStudentProfile[]>()
        : Promise.resolve({ data: [] as DbStudentProfile[], error: null }),
      taskIds.length
        ? supabase
            .from("task_submissions")
            .select("id,task_id,student_id,score,status,teacher_feedback,auto_feedback,submitted_at,reviewed_at")
            .in("task_id", taskIds)
            .returns<DbSubmission[]>()
        : Promise.resolve({ data: [] as DbSubmission[], error: null }),
      studentIds.length
        ? supabase
            .from("subject_skills")
            .select("id,student_id,subject,skill_name,level,mastery_percentage,weakness_tag,last_assessed_at")
            .in("student_id", studentIds)
            .returns<DbSubjectSkill[]>()
        : Promise.resolve({ data: [] as DbSubjectSkill[], error: null }),
      studentIds.length
        ? supabase
            .from("reward_transactions")
            .select("id,student_id,source_type,source_id,xp_amount,coin_amount,reason,created_at")
            .in("student_id", studentIds)
            .returns<DbReward[]>()
        : Promise.resolve({ data: [] as DbReward[], error: null }),
    ]);

    const dbStudents = studentsResult.data ?? [];
    const userIds = dbStudents.map((student) => student.user_id);
    const { data: studentUsers } = userIds.length
      ? await supabase
          .from("profiles")
          .select("id,name,email,role,avatar_url,profile_code,created_at")
          .in("id", userIds)
          .returns<DbProfile[]>()
      : { data: [] as DbProfile[] };
    const studentNameByUserId = Object.fromEntries(
      (studentUsers ?? []).map((profile) => [profile.id, profile.name]),
    );
    const realStudents = dbStudents.map(toStudentProfile);
    const realSubmissions = (submissionsResult.data ?? []).map((submission) => ({
      id: submission.id,
      taskId: submission.task_id,
      studentId: submission.student_id,
      score: Math.round(Number(submission.score ?? 0)),
      status: submission.status,
      teacherFeedback: submission.teacher_feedback ?? "",
      autoFeedback: submission.auto_feedback ?? "",
      submittedAt: submission.submitted_at,
      reviewedAt: submission.reviewed_at,
    }));
    const realSkills = (skillsResult.data ?? []).map((skill) => ({
      id: skill.id,
      studentId: skill.student_id,
      subject: skill.subject,
      skillName: skill.skill_name,
      level: Math.round(Number(skill.level)),
      masteryPercentage: Math.round(Number(skill.mastery_percentage)),
      weaknessTag: skill.weakness_tag ?? skill.skill_name,
      lastAssessedAt: skill.last_assessed_at ?? new Date().toISOString(),
    }));
    const realRewards = (rewardsResult.data ?? []).map((reward) => ({
      id: reward.id,
      studentId: reward.student_id,
      sourceType: reward.source_type,
      sourceId: reward.source_id ?? "",
      xpAmount: reward.xp_amount,
      coinAmount: reward.coin_amount,
      reason: reward.reason,
      createdAt: reward.created_at,
    }));
    const realClasses = dbClasses.map((classroom) => ({
      id: classroom.id,
      centreId: classroom.centre_id,
      teacherId: classroom.teacher_id,
      name: classroom.name,
      subject: classroom.subject,
      grade: classroom.grade,
      schedule: classroom.schedule,
      studentIds: (classroomLinks ?? [])
        .filter((link) => link.classroom_id === classroom.id)
        .map((link) => link.student_id),
    }));
    const weakStudents = [...realStudents]
      .filter(
        (student) =>
          student.homeworkCompletionRate < 82 ||
          student.attendanceRate < 92 ||
          realSkills.some(
            (skill) => skill.studentId === student.id && skill.masteryPercentage < 60,
          ),
      )
      .sort((a, b) => a.homeworkCompletionRate - b.homeworkCompletionRate);
    const topStudents = [...realStudents]
      .sort((a, b) => b.totalXP - a.totalXP)
      .slice(0, 4);
    const pendingSubmissions = realSubmissions
      .filter((submission) => submission.status === "submitted")
      .slice(0, 5);
    const subjectMastery = realClasses.map((classroom) => {
      const classroomStudentIds = new Set(classroom.studentIds);
      const masteryValues = realSkills
        .filter(
          (skill) =>
            skill.subject === classroom.subject && classroomStudentIds.has(skill.studentId),
        )
        .map((skill) => skill.masteryPercentage);

      return {
        subject: classroom.name,
        mastery: average(masteryValues),
      };
    });

    if (!teacher && !realClasses.length && !realStudents.length) return null;

    return {
      teacher,
      classes: realClasses,
      students: realStudents,
      tasks: realTasks,
      weakStudents,
      topStudents,
      pendingSubmissions,
      subjectMastery,
      leaderboard: topStudents,
      studentNameByUserId,
      teacherNameById: teacher ? { [teacher.id]: teacher.name } : {},
      taskTitleById: Object.fromEntries(realTasks.map((task) => [task.id, task.title])),
      summary: {
        classCount: realClasses.length,
        studentCount: realStudents.length,
        homeworkCompletion: average(
          realStudents.map((student) => student.homeworkCompletionRate),
        ),
        attendance: average(realStudents.map((student) => student.attendanceRate)),
        coinsGiven: realRewards.reduce((total, reward) => total + reward.coinAmount, 0),
      },
    };
  } catch {
    return null;
  }
}

export function getParentDashboard(parentId = "user_parent_1") {
  const child =
    students.find((student) => student.parentIds.includes(parentId)) ?? students[0];
  const pet = getStudentPet(child);
  const report = reports.find((item) => item.studentId === child.id) ?? reports[0];
  const skills = subjectSkills.filter((skill) => skill.studentId === child.id);
  const recentRewards = rewardTransactions
    .filter((reward) => reward.studentId === child.id)
    .slice(0, 3);

  return {
    parent: users.find((user) => user.id === parentId),
    child,
    childName: getStudentName(child),
    pet,
    cefrTarget: getCefrTargetForGrade(child.schoolGrade),
    englishStandards: getEnglishStandardsForGrade(child.schoolGrade),
    report,
    skills,
    monthlyTasks: getStudentTasks(child),
    recentRewards,
  };
}

export function getAdminDashboard() {
  const teachers = users.filter((user) => user.role === "teacher");
  const pendingSubmissions = taskSubmissions.filter(
    (submission) => submission.status === "submitted",
  );
  const reviewedSubmissions = taskSubmissions.filter(
    (submission) => submission.status === "reviewed",
  );
  const weakSkillTags = subjectSkills
    .filter((skill) => skill.masteryPercentage < 65)
    .map((skill) => skill.weaknessTag);
  const weakSkillOverview = [...new Set(weakSkillTags)]
    .map((tag) => ({
      tag,
      count: weakSkillTags.filter((item) => item === tag).length,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
  const studentsAtRisk = students.filter(
    (student) =>
      student.homeworkCompletionRate < 80 ||
      student.attendanceRate < 90 ||
      subjectSkills.some(
        (skill) => skill.studentId === student.id && skill.masteryPercentage < 60,
      ),
  );
  const teacherPerformance = teachers.map((teacher) => {
    const teacherClasses = classrooms.filter((classroom) => classroom.teacherId === teacher.id);
    const teacherClassIds = teacherClasses.map((classroom) => classroom.id);
    const teacherStudentIds = new Set(
      teacherClasses.flatMap((classroom) => classroom.studentIds),
    );
    const teacherTasks = tasks.filter((task) => task.teacherId === teacher.id);
    const teacherSubmissions = taskSubmissions.filter((submission) =>
      teacherTasks.some((task) => task.id === submission.taskId),
    );
    const teacherStudents = students.filter((student) => teacherStudentIds.has(student.id));

    return {
      teacher,
      classCount: teacherClassIds.length,
      studentCount: teacherStudents.length,
      taskCount: teacherTasks.length,
      pendingReviewCount: teacherSubmissions.filter(
        (submission) => submission.status === "submitted",
      ).length,
      reviewedCount: teacherSubmissions.filter(
        (submission) => submission.status === "reviewed",
      ).length,
      averageHomework: average(
        teacherStudents.map((student) => student.homeworkCompletionRate),
      ),
    };
  });
  const schoolTagOverview = schoolTags.map((tag) => {
    const tagStudents = students.filter((student) => tag.studentIds.includes(student.id));
    const tagClasses = classrooms.filter((classroom) =>
      classroom.studentIds.some((studentId) => tag.studentIds.includes(studentId)),
    );
    const averageHomework = average(
      tagStudents.map((student) => student.homeworkCompletionRate),
    );
    const averageAttendance = average(tagStudents.map((student) => student.attendanceRate));
    const averageXP = average(tagStudents.map((student) => student.totalXP));
    const atRiskCount = studentsAtRisk.filter((student) => tag.studentIds.includes(student.id))
      .length;

    return {
      ...tag,
      teacherCount: tag.teacherIds.length,
      studentCount: tag.studentIds.length,
      activeClassCount: tagClasses.length,
      averageHomework,
      averageAttendance,
      averageXP,
      atRiskCount,
      growthSignal: tag.studentIds.length >= 4 ? "Strong" : tag.studentIds.length >= 2 ? "Growing" : "Watch",
    };
  });

  return {
    centreName: "AiGenius Tuition Centre",
    users,
    teachers,
    students,
    classrooms,
    tasks,
    rewards: rewardTransactions,
    pets,
    cards,
    battles,
    schoolTags: schoolTagOverview,
    pendingSubmissions,
    reviewedSubmissions,
    studentsAtRisk,
    weakSkillOverview,
    teacherPerformance,
    teacherNameById: Object.fromEntries(teachers.map((teacher) => [teacher.id, teacher.name])),
    studentNameByUserId: Object.fromEntries(users.map((user) => [user.id, user.name])),
    reportControl: {
      generatedCount: reports.length,
      pendingTeacherCommentCount: Math.max(0, students.length - reports.length),
      viewedByParentCount: Math.max(1, Math.round(reports.length * 0.6)),
      noRecentProgressCount: studentsAtRisk.length,
    },
    subscription: {
      plan: "MVP Centre Plan",
      studentQuota: 100,
      teacherSeatQuota: 10,
      aiGenerationQuota: 500,
      aiGenerationUsed: tasks.length * 3,
      storageUsedPercent: 18,
      renewalLabel: "Not connected",
    },
    summary: {
      studentCount: students.length,
      teacherCount: teachers.length,
      classCount: classrooms.length,
      schoolTagCount: schoolTags.length,
      taskCount: tasks.length,
      averageAttendance: average(students.map((student) => student.attendanceRate)),
      averageHomework: average(students.map((student) => student.homeworkCompletionRate)),
      rewardEngagement: Math.min(100, Math.round((rewardTransactions.length / students.length) * 100)),
      totalRewardsIssued: rewardTransactions.reduce(
        (total, reward) => total + reward.coinAmount,
        0,
      ),
      monthlyLearningActivity: tasks.length + taskSubmissions.length + battles.length,
      pendingReviewCount: pendingSubmissions.length,
      reviewedSubmissionCount: reviewedSubmissions.length,
      atRiskStudentCount: studentsAtRisk.length,
      reportGeneratedCount: reports.length,
    },
  };
}

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

function toLearningTask(task: DbLearningTask): LearningTask {
  return {
    id: task.id,
    classId: task.class_id,
    teacherId: task.teacher_id,
    title: task.title,
    description: task.description,
    subject: task.subject,
    schoolGrade: "Year 4",
    cefrLevel: "A1",
    skillDomain: "Reading",
    skillTags: task.skill_tags ?? [],
    difficultyLevel: task.difficulty_level,
    taskBand: task.difficulty_level >= 4 ? "Challenge" : task.difficulty_level <= 2 ? "Foundation" : "Standard",
    questions: [],
    dueDate: task.due_date ?? new Date().toISOString(),
    xpReward: task.xp_reward,
    coinReward: task.coin_reward,
    status: task.status,
  };
}

function toPet(pet: DbPet): Pet {
  return {
    id: pet.id,
    studentId: pet.student_id,
    name: pet.name,
    species: pet.species,
    rarity: pet.rarity,
    stage: pet.stage,
    level: pet.level,
    xp: pet.xp,
    power: pet.power,
    wisdom: pet.wisdom,
    speed: pet.speed,
    focus: pet.focus,
    courage: pet.courage,
    kindness: pet.kindness,
    imageUrl: pet.image_url ?? "/pets/pet01.png",
  };
}

function toParentReport(report: DbParentReport) {
  return {
    id: report.id,
    studentId: report.student_id,
    month: report.month,
    summary: report.summary,
    strengths: report.strengths ?? [],
    weaknesses: report.weaknesses ?? [],
    recommendations: report.recommendations ?? [],
    teacherComment: report.teacher_comment ?? "Teacher comment will appear after review.",
    generatedAt: report.generated_at,
  };
}

function buildAutoParentReport(input: {
  student: StudentProfile;
  childName: string;
  skills: ReturnType<typeof getParentDashboard>["skills"];
  recentRewards: ReturnType<typeof getParentDashboard>["recentRewards"];
}) {
  const weakSkills = input.skills
    .filter((skill) => skill.masteryPercentage < 65)
    .slice(0, 3);
  const strongSkills = input.skills
    .filter((skill) => skill.masteryPercentage >= 75)
    .slice(0, 3);
  const month = new Date().toLocaleDateString("en-MY", {
    month: "long",
    year: "numeric",
  });

  return {
    id: `auto_report_${input.student.id}`,
    studentId: input.student.id,
    month,
    summary: `${input.childName} is building English consistency with ${input.student.homeworkCompletionRate}% homework completion and ${input.student.attendanceRate}% attendance.`,
    strengths: strongSkills.length
      ? strongSkills.map((skill) => skill.skillName)
      : ["Learning consistency", "Class participation"],
    weaknesses: weakSkills.length
      ? weakSkills.map((skill) => skill.weaknessTag)
      : ["No major repeated weakness detected"],
    recommendations: weakSkills.length
      ? weakSkills.map((skill) => `Practise ${skill.weaknessTag} in short daily English blocks.`)
      : ["Continue weekly reading, grammar, and vocabulary practice."],
    teacherComment:
      input.recentRewards.length > 0
        ? "Recent rewards show positive learning effort. Keep the routine steady."
        : "Teacher review will provide more specific guidance after submitted tasks.",
    generatedAt: new Date().toISOString(),
  };
}

export async function getStudentDashboardFromSupabase(userId: string) {
  if (!isSupabaseConfigured() || !process.env.SUPABASE_SERVICE_ROLE_KEY) return null;

  try {
    const supabase = getSupabaseServiceRoleClient();
    const { data: profile } = await supabase
      .from("profiles")
      .select("id,name,email,role,avatar_url,profile_code,created_at")
      .eq("id", userId)
      .maybeSingle<DbProfile>();
    const { data: studentRow } = await supabase
      .from("student_profiles")
      .select("id,user_id,parent_ids,referral_code,school_grade,actual_learning_level,target_learning_level,subjects,pet_id,total_xp,star_coins,streak_days,attendance_rate,homework_completion_rate")
      .eq("user_id", userId)
      .maybeSingle<DbStudentProfile>();

    if (!profile || !studentRow) return null;

    const student = toStudentProfile(studentRow);
    const [
      petResult,
      tasksResult,
      skillsResult,
      rewardsResult,
      submissionsResult,
      reportResult,
    ] = await Promise.all([
      supabase
        .from("pets")
        .select("id,student_id,name,species,rarity,stage,level,xp,power,wisdom,speed,focus,courage,kindness,image_url")
        .eq("student_id", student.id)
        .maybeSingle<DbPet>(),
      supabase
        .from("classroom_students")
        .select("classroom_id")
        .eq("student_id", student.id)
        .returns<DbClassroomStudent[]>(),
      supabase
        .from("subject_skills")
        .select("id,student_id,subject,skill_name,level,mastery_percentage,weakness_tag,last_assessed_at")
        .eq("student_id", student.id)
        .returns<DbSubjectSkill[]>(),
      supabase
        .from("reward_transactions")
        .select("id,student_id,source_type,source_id,xp_amount,coin_amount,reason,created_at")
        .eq("student_id", student.id)
        .order("created_at", { ascending: false })
        .limit(4)
        .returns<DbReward[]>(),
      supabase
        .from("task_submissions")
        .select("id,task_id,student_id,score,status,teacher_feedback,auto_feedback,submitted_at,reviewed_at")
        .eq("student_id", student.id)
        .returns<DbSubmission[]>(),
      supabase
        .from("parent_reports")
        .select("id,student_id,month,summary,strengths,weaknesses,recommendations,teacher_comment,generated_at")
        .eq("student_id", student.id)
        .order("generated_at", { ascending: false })
        .limit(1)
        .maybeSingle<DbParentReport>(),
    ]);

    const classroomIds = (tasksResult.data ?? []).map((link) => link.classroom_id);
    const { data: dbTasks } = classroomIds.length
      ? await supabase
          .from("learning_tasks")
          .select("id,class_id,teacher_id,title,description,subject,skill_tags,difficulty_level,due_date,xp_reward,coin_reward,status")
          .in("class_id", classroomIds)
          .in("status", ["assigned", "submitted", "reviewed"])
          .returns<DbLearningTask[]>()
      : { data: [] as DbLearningTask[] };
    const liveTasks = (dbTasks ?? []).map(toLearningTask).slice(0, 5);
    const liveSkills = (skillsResult.data ?? []).map((skill) => ({
      id: skill.id,
      studentId: skill.student_id,
      subject: skill.subject,
      skillName: skill.skill_name,
      level: Math.round(Number(skill.level)),
      masteryPercentage: Math.round(Number(skill.mastery_percentage)),
      weaknessTag: skill.weakness_tag ?? skill.skill_name,
      lastAssessedAt: skill.last_assessed_at ?? new Date().toISOString(),
    }));
    const liveRewards = (rewardsResult.data ?? []).map((reward) => ({
      id: reward.id,
      studentId: reward.student_id,
      sourceType: reward.source_type,
      sourceId: reward.source_id ?? "",
      xpAmount: reward.xp_amount,
      coinAmount: reward.coin_amount,
      reason: reward.reason,
      createdAt: reward.created_at,
    }));
    const reviewedSubmissions = (submissionsResult.data ?? []).filter(
      (submission) => submission.status === "reviewed",
    );
    const report =
      reportResult.data ? toParentReport(reportResult.data) : buildAutoParentReport({
        student,
        childName: profile.name,
        skills: liveSkills,
        recentRewards: liveRewards,
      });

    return {
      student,
      studentName: profile.name,
      pet: petResult.data ? toPet(petResult.data) : getStudentPet(students[0]),
      cefrTarget: getCefrTargetForGrade(student.schoolGrade),
      englishStandards: getEnglishStandardsForGrade(student.schoolGrade),
      tasks: liveTasks,
      completedTaskCount: reviewedSubmissions.length,
      skills: liveSkills,
      report,
      recentRewards: liveRewards,
      cards: cards.slice(0, 3),
    };
  } catch {
    return null;
  }
}

export async function getParentDashboardFromSupabase(parentId: string) {
  if (!isSupabaseConfigured() || !process.env.SUPABASE_SERVICE_ROLE_KEY) return null;

  try {
    const supabase = getSupabaseServiceRoleClient();
    const { data: parent } = await supabase
      .from("profiles")
      .select("id,name,email,role,avatar_url,profile_code,created_at")
      .eq("id", parentId)
      .maybeSingle<DbProfile>();

    if (!parent) return null;

    const { data: linkedChildren } = await supabase
      .from("parent_student_links")
      .select("parent_id,student_id,status")
      .eq("parent_id", parentId)
      .eq("status", "active")
      .returns<DbParentStudentLink[]>();
    const linkedStudentId = linkedChildren?.[0]?.student_id;
    const childQuery = supabase
      .from("student_profiles")
      .select("id,user_id,parent_ids,referral_code,school_grade,actual_learning_level,target_learning_level,subjects,pet_id,total_xp,star_coins,streak_days,attendance_rate,homework_completion_rate");
    const { data: childRow } = linkedStudentId
      ? await childQuery.eq("id", linkedStudentId).maybeSingle<DbStudentProfile>()
      : await childQuery.contains("parent_ids", [parentId]).maybeSingle<DbStudentProfile>();

    if (!childRow) return null;

    const child = toStudentProfile(childRow);
    const { data: childProfile } = await supabase
      .from("profiles")
      .select("id,name,email,role,avatar_url,profile_code,created_at")
      .eq("id", child.userId)
      .maybeSingle<DbProfile>();
    const [
      petResult,
      skillsResult,
      rewardsResult,
      reportResult,
    ] = await Promise.all([
      supabase
        .from("pets")
        .select("id,student_id,name,species,rarity,stage,level,xp,power,wisdom,speed,focus,courage,kindness,image_url")
        .eq("student_id", child.id)
        .maybeSingle<DbPet>(),
      supabase
        .from("subject_skills")
        .select("id,student_id,subject,skill_name,level,mastery_percentage,weakness_tag,last_assessed_at")
        .eq("student_id", child.id)
        .returns<DbSubjectSkill[]>(),
      supabase
        .from("reward_transactions")
        .select("id,student_id,source_type,source_id,xp_amount,coin_amount,reason,created_at")
        .eq("student_id", child.id)
        .order("created_at", { ascending: false })
        .limit(4)
        .returns<DbReward[]>(),
      supabase
        .from("parent_reports")
        .select("id,student_id,month,summary,strengths,weaknesses,recommendations,teacher_comment,generated_at")
        .eq("student_id", child.id)
        .order("generated_at", { ascending: false })
        .limit(1)
        .maybeSingle<DbParentReport>(),
    ]);
    const liveSkills = (skillsResult.data ?? []).map((skill) => ({
      id: skill.id,
      studentId: skill.student_id,
      subject: skill.subject,
      skillName: skill.skill_name,
      level: Math.round(Number(skill.level)),
      masteryPercentage: Math.round(Number(skill.mastery_percentage)),
      weaknessTag: skill.weakness_tag ?? skill.skill_name,
      lastAssessedAt: skill.last_assessed_at ?? new Date().toISOString(),
    }));
    const liveRewards = (rewardsResult.data ?? []).map((reward) => ({
      id: reward.id,
      studentId: reward.student_id,
      sourceType: reward.source_type,
      sourceId: reward.source_id ?? "",
      xpAmount: reward.xp_amount,
      coinAmount: reward.coin_amount,
      reason: reward.reason,
      createdAt: reward.created_at,
    }));
    const childName = childProfile?.name ?? "Child";
    const report =
      reportResult.data ? toParentReport(reportResult.data) : buildAutoParentReport({
        student: child,
        childName,
        skills: liveSkills,
        recentRewards: liveRewards,
      });

    return {
      parent: toUser(parent),
      child,
      childName,
      pet: petResult.data ? toPet(petResult.data) : getStudentPet(students[0]),
      cefrTarget: getCefrTargetForGrade(child.schoolGrade),
      englishStandards: getEnglishStandardsForGrade(child.schoolGrade),
      report,
      skills: liveSkills,
      monthlyTasks: [],
      recentRewards: liveRewards,
    };
  } catch {
    return null;
  }
}

export async function getAdminDashboardFromSupabase() {
  if (!isSupabaseConfigured() || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return null;
  }

  try {
    const supabase = getSupabaseServiceRoleClient();
    const [
      profilesResult,
      classroomsResult,
      classroomStudentsResult,
      studentsResult,
      tasksResult,
      submissionsResult,
      skillsResult,
      rewardsResult,
      schoolTagsResult,
      profileSchoolTagsResult,
      reportsResult,
    ] = await Promise.all([
      supabase.from("profiles").select("id,name,email,role,avatar_url,profile_code,created_at").returns<DbProfile[]>(),
      supabase.from("classrooms").select("id,centre_id,teacher_id,name,subject,grade,schedule").returns<DbClassroom[]>(),
      supabase.from("classroom_students").select("classroom_id,student_id").returns<DbClassroomStudent[]>(),
      supabase.from("student_profiles").select("id,user_id,parent_ids,referral_code,school_grade,actual_learning_level,target_learning_level,subjects,pet_id,total_xp,star_coins,streak_days,attendance_rate,homework_completion_rate").returns<DbStudentProfile[]>(),
      supabase.from("learning_tasks").select("id,class_id,teacher_id,title,description,subject,skill_tags,difficulty_level,due_date,xp_reward,coin_reward,status").returns<DbLearningTask[]>(),
      supabase.from("task_submissions").select("id,task_id,student_id,score,status,teacher_feedback,auto_feedback,submitted_at,reviewed_at").returns<DbSubmission[]>(),
      supabase.from("subject_skills").select("id,student_id,subject,skill_name,level,mastery_percentage,weakness_tag,last_assessed_at").returns<DbSubjectSkill[]>(),
      supabase.from("reward_transactions").select("id,student_id,source_type,source_id,xp_amount,coin_amount,reason,created_at").returns<DbReward[]>(),
      supabase.from("school_tags").select("id,centre_id,name,code,area").returns<DbSchoolTag[]>(),
      supabase.from("profile_school_tags").select("profile_id,school_tag_id,role").returns<DbProfileSchoolTag[]>(),
      supabase.from("parent_reports").select("id,student_id,month,summary,strengths,weaknesses,recommendations,teacher_comment,generated_at").returns<DbParentReport[]>(),
    ]);

    if (profilesResult.error || studentsResult.error) return null;

    const dbProfiles = profilesResult.data ?? [];
    const dbStudents = studentsResult.data ?? [];
    if (!dbProfiles.length && !dbStudents.length) return null;

    const realUsers = dbProfiles.map(toUser);
    const teachers = realUsers.filter((user) => user.role === "teacher");
    const teacherNameById = Object.fromEntries(teachers.map((teacher) => [teacher.id, teacher.name]));
    const studentNameByUserId = Object.fromEntries(
      realUsers.filter((user) => user.role === "student").map((user) => [user.id, user.name]),
    );
    const realStudents = dbStudents.map(toStudentProfile);
    const realTasks = (tasksResult.data ?? []).map(toLearningTask);
    const realSubmissions = (submissionsResult.data ?? []).map((submission) => ({
      id: submission.id,
      taskId: submission.task_id,
      studentId: submission.student_id,
      score: Math.round(Number(submission.score ?? 0)),
      status: submission.status,
      teacherFeedback: submission.teacher_feedback ?? "",
      autoFeedback: submission.auto_feedback ?? "",
      submittedAt: submission.submitted_at,
      reviewedAt: submission.reviewed_at,
    }));
    const realSkills = (skillsResult.data ?? []).map((skill) => ({
      id: skill.id,
      studentId: skill.student_id,
      subject: skill.subject,
      skillName: skill.skill_name,
      level: Math.round(Number(skill.level)),
      masteryPercentage: Math.round(Number(skill.mastery_percentage)),
      weaknessTag: skill.weakness_tag ?? skill.skill_name,
      lastAssessedAt: skill.last_assessed_at ?? new Date().toISOString(),
    }));
    const realRewards = (rewardsResult.data ?? []).map((reward) => ({
      id: reward.id,
      studentId: reward.student_id,
      sourceType: reward.source_type,
      sourceId: reward.source_id ?? "",
      xpAmount: reward.xp_amount,
      coinAmount: reward.coin_amount,
      reason: reward.reason,
      createdAt: reward.created_at,
    }));
    const classroomLinks = classroomStudentsResult.data ?? [];
    const realClassrooms = (classroomsResult.data ?? []).map((classroom) => ({
      id: classroom.id,
      centreId: classroom.centre_id,
      teacherId: classroom.teacher_id,
      name: classroom.name,
      subject: classroom.subject,
      grade: classroom.grade,
      schedule: classroom.schedule,
      studentIds: classroomLinks
        .filter((link) => link.classroom_id === classroom.id)
        .map((link) => link.student_id),
    }));
    const pendingSubmissions = realSubmissions.filter(
      (submission) => submission.status === "submitted",
    );
    const reviewedSubmissions = realSubmissions.filter(
      (submission) => submission.status === "reviewed",
    );
    const weakSkillTags = realSkills
      .filter((skill) => skill.masteryPercentage < 65)
      .map((skill) => skill.weaknessTag);
    const weakSkillOverview = [...new Set(weakSkillTags)]
      .map((tag) => ({
        tag,
        count: weakSkillTags.filter((item) => item === tag).length,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    const studentsAtRisk = realStudents.filter(
      (student) =>
        student.homeworkCompletionRate < 80 ||
        student.attendanceRate < 90 ||
        realSkills.some(
          (skill) => skill.studentId === student.id && skill.masteryPercentage < 60,
        ),
    );
    const teacherPerformance = teachers.map((teacher) => {
      const teacherClasses = realClassrooms.filter(
        (classroom) => classroom.teacherId === teacher.id,
      );
      const teacherStudentIds = new Set(
        teacherClasses.flatMap((classroom) => classroom.studentIds),
      );
      const teacherTasks = realTasks.filter((task) => task.teacherId === teacher.id);
      const teacherSubmissions = realSubmissions.filter((submission) =>
        teacherTasks.some((task) => task.id === submission.taskId),
      );
      const teacherStudents = realStudents.filter((student) =>
        teacherStudentIds.has(student.id),
      );

      return {
        teacher,
        classCount: teacherClasses.length,
        studentCount: teacherStudents.length,
        taskCount: teacherTasks.length,
        pendingReviewCount: teacherSubmissions.filter(
          (submission) => submission.status === "submitted",
        ).length,
        reviewedCount: teacherSubmissions.filter(
          (submission) => submission.status === "reviewed",
        ).length,
        averageHomework: average(
          teacherStudents.map((student) => student.homeworkCompletionRate),
        ),
      };
    });
    const profileSchoolTags = profileSchoolTagsResult.data ?? [];
    const schoolTagOverview = (schoolTagsResult.data ?? []).map((tag) => {
      const linkedProfiles = profileSchoolTags.filter((link) => link.school_tag_id === tag.id);
      const tagTeacherIds = linkedProfiles
        .filter((link) => link.role === "teacher")
        .map((link) => link.profile_id);
      const tagStudentUserIds = linkedProfiles
        .filter((link) => link.role === "student")
        .map((link) => link.profile_id);
      const tagStudents = realStudents.filter((student) =>
        tagStudentUserIds.includes(student.userId),
      );
      const tagStudentIds = tagStudents.map((student) => student.id);
      const tagClasses = realClassrooms.filter(
        (classroom) =>
          tagTeacherIds.includes(classroom.teacherId) ||
          classroom.studentIds.some((studentId) => tagStudentIds.includes(studentId)),
      );
      const atRiskCount = studentsAtRisk.filter((student) =>
        tagStudentIds.includes(student.id),
      ).length;

      return {
        id: tag.id,
        centreId: tag.centre_id ?? "",
        name: tag.name,
        code: tag.code,
        area: tag.area ?? "Unassigned area",
        teacherIds: tagTeacherIds,
        studentIds: tagStudentIds,
        teacherCount: tagTeacherIds.length,
        studentCount: tagStudentIds.length,
        activeClassCount: tagClasses.length,
        averageHomework: average(tagStudents.map((student) => student.homeworkCompletionRate)),
        averageAttendance: average(tagStudents.map((student) => student.attendanceRate)),
        averageXP: average(tagStudents.map((student) => student.totalXP)),
        atRiskCount,
        growthSignal: tagStudentIds.length >= 20 ? "Strong" : tagStudentIds.length >= 5 ? "Growing" : "Watch",
      };
    });
    const realReports = reportsResult.data ?? [];

    return {
      centreName: "AiGenius Tuition Centre",
      users: realUsers,
      teachers,
      students: realStudents,
      classrooms: realClassrooms,
      tasks: realTasks,
      rewards: realRewards,
      pets,
      cards,
      battles,
      schoolTags: schoolTagOverview.length ? schoolTagOverview : getAdminDashboard().schoolTags,
      pendingSubmissions,
      reviewedSubmissions,
      studentsAtRisk,
      weakSkillOverview: weakSkillOverview.length ? weakSkillOverview : getAdminDashboard().weakSkillOverview,
      teacherPerformance,
      teacherNameById,
      studentNameByUserId,
      reportControl: {
        generatedCount: realReports.length,
        pendingTeacherCommentCount: realReports.filter((report) => !report.teacher_comment).length,
        viewedByParentCount: Math.max(0, Math.round(realReports.length * 0.6)),
        noRecentProgressCount: studentsAtRisk.length,
      },
      subscription: {
        plan: "MVP Centre Plan",
        studentQuota: 100,
        teacherSeatQuota: 10,
        aiGenerationQuota: 500,
        aiGenerationUsed: realTasks.length * 3,
        storageUsedPercent: 18,
        renewalLabel: "Not connected",
      },
      summary: {
        studentCount: realStudents.length,
        teacherCount: teachers.length,
        classCount: realClassrooms.length,
        schoolTagCount: schoolTagOverview.length,
        taskCount: realTasks.length,
        averageAttendance: average(realStudents.map((student) => student.attendanceRate)),
        averageHomework: average(realStudents.map((student) => student.homeworkCompletionRate)),
        rewardEngagement: Math.min(
          100,
          Math.round((realRewards.length / Math.max(1, realStudents.length)) * 100),
        ),
        totalRewardsIssued: realRewards.reduce((total, reward) => total + reward.coinAmount, 0),
        monthlyLearningActivity: realTasks.length + realSubmissions.length + battles.length,
        pendingReviewCount: pendingSubmissions.length,
        reviewedSubmissionCount: reviewedSubmissions.length,
        atRiskStudentCount: studentsAtRisk.length,
        reportGeneratedCount: realReports.length,
      },
    };
  } catch {
    return null;
  }
}

export function getTaskTitle(taskId: string) {
  return tasks.find((task) => task.id === taskId)?.title ?? "Learning task";
}

export function getClassTeacherName(classroom: Classroom) {
  return getUserName(classroom.teacherId);
}

export function getTaskDueLabel(task: LearningTask) {
  const dueDate = new Date(`${task.dueDate}T00:00:00`);

  return dueDate.toLocaleDateString("en-MY", {
    month: "short",
    day: "numeric",
  });
}

export function getPetStageIndex(pet: Pet) {
  const stageIndex = {
    baby: 0,
    junior: 1,
    advanced: 2,
    legendary: 3,
  };

  return stageIndex[pet.stage];
}
