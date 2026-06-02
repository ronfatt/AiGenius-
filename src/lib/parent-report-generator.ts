import { getCefrTargetForGrade } from "./cefr-level";
import { adminTable } from "./supabase-admin-tables";
import { getSupabaseServiceRoleClient, isSupabaseConfigured } from "./supabase";

type DbParentStudentLink = {
  student_id: string;
};

type DbStudentProfile = {
  id: string;
  user_id: string;
  school_grade: string;
  actual_learning_level: number;
  target_learning_level: number;
  streak_days: number;
  attendance_rate: number;
  homework_completion_rate: number;
};

type DbProfile = {
  name: string;
};

type DbSkill = {
  skill_name: string;
  mastery_percentage: number;
  weakness_tag: string | null;
};

type DbSubmission = {
  score: number | null;
  status: string;
};

type DbReward = {
  xp_amount: number;
  coin_amount: number;
  reason: string;
};

function reportMonth() {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "Asia/Kuala_Lumpur",
  }).format(new Date());
}

function average(values: number[]) {
  if (!values.length) return 0;
  return Math.round(values.reduce((total, value) => total + value, 0) / values.length);
}

function uniqueList(items: Array<string | null | undefined>, limit = 8) {
  return [...new Set(items.map((item) => String(item ?? "").trim()).filter(Boolean))].slice(0, limit);
}

function levelNumberLabel(value: number) {
  return `Level ${Number(value).toFixed(1)}`;
}

export async function generateMonthlyParentReportForStudent(studentId: string) {
  if (!isSupabaseConfigured() || !process.env.SUPABASE_SERVICE_ROLE_KEY) return null;

  const supabase = getSupabaseServiceRoleClient();
  const { data: student } = await supabase
    .from("student_profiles")
    .select("id,user_id,school_grade,actual_learning_level,target_learning_level,streak_days,attendance_rate,homework_completion_rate")
    .eq("id", studentId)
    .maybeSingle<DbStudentProfile>();

  if (!student) return null;

  const month = reportMonth();
  const [profileResult, skillsResult, submissionsResult, rewardsResult] = await Promise.all([
    supabase.from("profiles").select("name").eq("id", student.user_id).maybeSingle<DbProfile>(),
    supabase
      .from("subject_skills")
      .select("skill_name,mastery_percentage,weakness_tag")
      .eq("student_id", student.id)
      .returns<DbSkill[]>(),
    supabase
      .from("task_submissions")
      .select("score,status")
      .eq("student_id", student.id)
      .returns<DbSubmission[]>(),
    supabase
      .from("reward_transactions")
      .select("xp_amount,coin_amount,reason")
      .eq("student_id", student.id)
      .returns<DbReward[]>(),
  ]);
  const childName = profileResult.data?.name ?? "Student";
  const skills = skillsResult.data ?? [];
  const reviewedScores = (submissionsResult.data ?? [])
    .filter((submission) => submission.status === "reviewed" && submission.score !== null)
    .map((submission) => Math.round(Number(submission.score)));
  const avgScore = average(reviewedScores);
  const weakSkills = skills
    .filter((skill) => Number(skill.mastery_percentage) < 60 || skill.weakness_tag)
    .map((skill) => skill.weakness_tag ?? skill.skill_name);
  const strongSkills = skills
    .filter((skill) => Number(skill.mastery_percentage) >= 80)
    .map((skill) => skill.skill_name);
  const rewardCount = rewardsResult.data?.length ?? 0;
  const cefrTarget = getCefrTargetForGrade(student.school_grade);
  const summary = `${childName} is currently at ${levelNumberLabel(Number(student.actual_learning_level))} against ${student.school_grade}, targeting ${levelNumberLabel(Number(student.target_learning_level))} and CEFR ${cefrTarget}. Average reviewed task score this month is ${avgScore || "pending"}%.`;
  const strengths = uniqueList([
    ...strongSkills,
    Number(student.attendance_rate) >= 85 ? "consistent attendance" : null,
    Number(student.homework_completion_rate) >= 80 ? "homework follow-through" : null,
    rewardCount > 0 ? "positive learning effort" : null,
  ]);
  const weaknesses = uniqueList([
    ...weakSkills,
    Number(student.actual_learning_level) + 0.8 < Number(student.target_learning_level)
      ? "learning level gap"
      : null,
  ]);
  const recommendations = uniqueList([
    weaknesses[0] ? `Practise ${weaknesses[0]} in short daily English blocks.` : null,
    avgScore && avgScore >= 85 ? `Try one CEFR ${cefrTarget} challenge task next.` : null,
    avgScore && avgScore < 60 ? "Schedule teacher intervention for foundation review." : null,
    Number(student.streak_days) < 3 ? "Build a 3-day weekly English routine." : null,
    "Continue reading, grammar, and vocabulary practice with teacher feedback.",
  ], 6);
  const teacherComment =
    reviewedScores.length > 0
      ? `${childName} has ${reviewedScores.length} reviewed English submission(s). Focus next on ${weaknesses[0] ?? "steady skill growth"}.`
      : "Teacher comments will become more specific after the first reviewed English task.";

  const { error } = await adminTable("parent_reports").upsert(
    {
      student_id: student.id,
      month,
      summary,
      strengths: strengths.length ? strengths : ["learning effort"],
      weaknesses: weaknesses.length ? weaknesses : ["No repeated weakness detected yet"],
      recommendations,
      teacher_comment: teacherComment,
      generated_at: new Date().toISOString(),
    },
    { onConflict: "student_id,month" },
  );

  return error ? null : { studentId: student.id, month };
}

export async function generateMonthlyParentReportForParent(parentId: string) {
  if (!isSupabaseConfigured() || !process.env.SUPABASE_SERVICE_ROLE_KEY) return null;

  const supabase = getSupabaseServiceRoleClient();
  const { data: link } = await supabase
    .from("parent_student_links")
    .select("student_id")
    .eq("parent_id", parentId)
    .eq("status", "active")
    .limit(1)
    .maybeSingle<DbParentStudentLink>();

  if (!link?.student_id) return null;

  return generateMonthlyParentReportForStudent(link.student_id);
}
