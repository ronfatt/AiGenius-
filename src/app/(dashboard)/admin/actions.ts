"use server";

import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";
import { generateFiveLetterCode, generateStudentReferralCode } from "@/lib/referrals";
import { getSupabaseServiceRoleClient } from "@/lib/supabase";
import { adminTable } from "@/lib/supabase-admin-tables";
import type { UserRole } from "@/lib/types";

function withMessage(path: string, key: "status" | "error", message: string) {
  return `${path}?${key}=${encodeURIComponent(message)}`;
}

export async function createSchoolTagAction(formData: FormData) {
  const profile = await getCurrentProfile();

  if (!profile || profile.role !== "admin") {
    redirect(withMessage("/admin", "error", "Please login as admin first."));
  }

  const name = String(formData.get("name") ?? "").trim();
  const code = String(formData.get("code") ?? "").trim().toUpperCase();
  const area = String(formData.get("area") ?? "").trim();

  if (!name || !code) {
    redirect(withMessage("/admin", "error", "School name and code are required."));
  }

  const { error } = await adminTable("school_tags").upsert(
    {
      centre_id: profile.centre_id,
      name,
      code,
      area,
    },
    { onConflict: "code" },
  );

  if (error) {
    redirect(withMessage("/admin", "error", error.message));
  }

  redirect(withMessage("/admin", "status", "School tag saved."));
}

type CentreLookup = {
  id: string;
};

type ClassroomTeacherLookup = {
  teacher_id: string;
};

const adminCreatableRoles: UserRole[] = ["teacher", "student", "parent"];

async function requireAdmin() {
  const profile = await getCurrentProfile();

  if (!profile || profile.role !== "admin") {
    redirect(withMessage("/admin/setup", "error", "Please login as admin first."));
  }

  return profile;
}

async function getOrCreateCentreId(profile: Awaited<ReturnType<typeof requireAdmin>>) {
  if (profile.centre_id) return profile.centre_id;

  const { data: centre, error: centreError } = await adminTable("centres")
    .insert({
      name: "AiGenius Tuition Centre",
      logo_url: "/aigenius-logo.png",
    })
    .select("id")
    .single<CentreLookup>();

  if (centreError || !centre) {
    redirect(
      withMessage(
        "/admin/setup",
        "error",
        centreError?.message ?? "Unable to create centre profile.",
      ),
    );
  }

  const { error: profileError } = await adminTable("profiles")
    .update({ centre_id: centre.id })
    .eq("id", profile.id);

  if (profileError) {
    redirect(withMessage("/admin/setup", "error", profileError.message));
  }

  return centre.id;
}

export async function createClassAction(formData: FormData) {
  const profile = await requireAdmin();
  const centreId = await getOrCreateCentreId(profile);
  const name = String(formData.get("name") ?? "").trim();
  const teacherId = String(formData.get("teacherId") ?? "").trim();
  const grade = String(formData.get("grade") ?? "").trim();
  const subject = String(formData.get("subject") ?? "English").trim() || "English";
  const schedule = String(formData.get("schedule") ?? "").trim();

  if (!name || !teacherId || !grade || !schedule) {
    redirect(
      withMessage(
        "/admin/setup",
        "error",
        "Class name, teacher, grade, and schedule are required.",
      ),
    );
  }

  const { error } = await adminTable("classrooms").insert({
    centre_id: centreId,
    teacher_id: teacherId,
    name,
    subject,
    grade,
    schedule,
  });

  if (error) {
    redirect(withMessage("/admin/setup", "error", error.message));
  }

  redirect(withMessage("/admin/setup", "status", "Class created."));
}

export async function assignStudentToClassAction(formData: FormData) {
  await requireAdmin();
  const classroomId = String(formData.get("classroomId") ?? "").trim();
  const studentId = String(formData.get("studentId") ?? "").trim();

  if (!classroomId || !studentId) {
    redirect(withMessage("/admin/setup", "error", "Choose a class and student."));
  }

  const { error: assignError } = await adminTable("classroom_students").upsert(
    {
      classroom_id: classroomId,
      student_id: studentId,
    },
    { onConflict: "classroom_id,student_id" },
  );

  if (assignError) {
    redirect(withMessage("/admin/setup", "error", assignError.message));
  }

  const { data: classroom } = await adminTable("classrooms")
    .select("teacher_id")
    .eq("id", classroomId)
    .maybeSingle<ClassroomTeacherLookup>();

  if (classroom?.teacher_id) {
    await adminTable("teacher_student_links").upsert(
      {
        teacher_id: classroom.teacher_id,
        student_id: studentId,
        status: "active",
        source: "classroom",
      },
      { onConflict: "teacher_id,student_id" },
    );
  }

  redirect(withMessage("/admin/setup", "status", "Student assigned to class."));
}

export async function createUserByAdminAction(formData: FormData) {
  const profile = await requireAdmin();
  const centreId = await getOrCreateCentreId(profile);
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "").trim();
  const role = String(formData.get("role") ?? "student") as UserRole;
  const schoolGrade = String(formData.get("schoolGrade") ?? "Year 4");

  if (!name || !email || password.length < 6 || !adminCreatableRoles.includes(role)) {
    redirect(
      withMessage(
        "/admin/setup",
        "error",
        "Enter name, email, password of at least 6 characters, and a valid role.",
      ),
    );
  }

  const adminSupabase = getSupabaseServiceRoleClient();
  const { data: authData, error: authError } = await adminSupabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name, role },
  });

  if (authError || !authData.user) {
    redirect(withMessage("/admin/setup", "error", authError?.message ?? "Unable to create user."));
  }

  const userId = authData.user.id;
  const codeSeed = userId
    .split("")
    .reduce((total, character) => total + character.charCodeAt(0), Date.now());
  const { error: profileError } = await adminTable("profiles").insert({
    id: userId,
    centre_id: centreId,
    name,
    email,
    role,
    profile_code: generateFiveLetterCode(name, codeSeed),
    avatar_url: "/aigenius-logo.png",
  });

  if (profileError) {
    await adminSupabase.auth.admin.deleteUser(userId);
    redirect(withMessage("/admin/setup", "error", profileError.message));
  }

  if (role === "student") {
    const schoolYear = Number(schoolGrade.replace("Year ", ""));
    const { data: studentProfile, error: studentError } = await adminTable("student_profiles")
      .insert({
        user_id: userId,
        referral_code: generateStudentReferralCode(name, codeSeed),
        school_grade: schoolGrade,
        actual_learning_level: Math.max(1, schoolYear - 1),
        target_learning_level: schoolYear,
        subjects: ["English"],
        total_xp: 0,
        star_coins: 20,
        streak_days: 0,
        attendance_rate: 0,
        homework_completion_rate: 0,
      })
      .select("id")
      .single<{ id: string }>();

    if (studentError || !studentProfile) {
      await adminSupabase.auth.admin.deleteUser(userId);
      redirect(
        withMessage(
          "/admin/setup",
          "error",
          studentError?.message ?? "Unable to create student profile.",
        ),
      );
    }

    const { data: pet, error: petError } = await adminTable("pets")
      .insert({
        student_id: studentProfile.id,
        name: `${name.split(" ")[0] || "Student"}'s Nova`,
        species: "Star Pup",
        rarity: "common",
        stage: "baby",
        level: 1,
        xp: 0,
        power: 45,
        wisdom: 45,
        speed: 50,
        focus: 50,
        courage: 45,
        kindness: 55,
        image_url: "/pets/pet01.png",
      })
      .select("id")
      .single<{ id: string }>();

    if (petError || !pet) {
      await adminSupabase.auth.admin.deleteUser(userId);
      redirect(withMessage("/admin/setup", "error", petError?.message ?? "Unable to create pet."));
    }

    await adminTable("student_profiles").update({ pet_id: pet.id }).eq("id", studentProfile.id);
  }

  redirect(withMessage("/admin/setup", "status", `${role} account created.`));
}
