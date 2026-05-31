"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { getSupabaseServiceRoleClient } from "@/lib/supabase";
import { generateFiveLetterCode, generateStudentReferralCode } from "@/lib/referrals";
import type { UserRole } from "@/lib/types";

const allowedRegisterRoles: UserRole[] = ["student", "parent", "teacher"];

type SupabaseMutationError = {
  message: string;
};

type SupabaseInsertResult = PromiseLike<{
  error: SupabaseMutationError | null;
}> & {
  select: (columns: string) => {
    single: <T>() => Promise<{
      data: T | null;
      error: SupabaseMutationError | null;
    }>;
  };
};

type SupabaseUpdateResult = {
  eq: (column: string, value: string) => Promise<{
    error: SupabaseMutationError | null;
  }>;
};

type SupabaseTable = {
  insert: (values: Record<string, unknown> | Record<string, unknown>[]) => SupabaseInsertResult;
  update: (values: Record<string, unknown>) => SupabaseUpdateResult;
};

function fromTable(client: ReturnType<typeof getSupabaseServiceRoleClient>, tableName: string) {
  return client.from(tableName) as unknown as SupabaseTable;
}

function withError(path: string, message: string) {
  return `${path}?error=${encodeURIComponent(message)}`;
}

function getDashboardPath(role: UserRole) {
  if (role === "teacher") return "/teacher";
  if (role === "parent") return "/parent";
  return "/student";
}

export async function registerAction(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const role = String(formData.get("role") ?? "student") as UserRole;
  const schoolGrade = String(formData.get("schoolGrade") ?? "Year 5");

  if (!name || !email || !password) {
    redirect(withError("/register", "Please enter name, email, and password."));
  }

  if (password.length < 6) {
    redirect(withError("/register", "Password must be at least 6 characters."));
  }

  if (!allowedRegisterRoles.includes(role)) {
    redirect(withError("/register", "Please choose Student, Parent, or Teacher."));
  }

  const adminSupabase = getSupabaseServiceRoleClient();
  const { data: authData, error: authError } = await adminSupabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      name,
      role,
    },
  });

  if (authError || !authData.user) {
    redirect(withError("/register", authError?.message ?? "Unable to create account."));
  }

  const userId = authData.user.id;
  const codeSeed = userId
    .split("")
    .reduce((total, character) => total + character.charCodeAt(0), Date.now());

  const profilesTable = fromTable(adminSupabase, "profiles");
  const studentProfilesTable = fromTable(adminSupabase, "student_profiles");
  const petsTable = fromTable(adminSupabase, "pets");
  const schoolYear = Number(schoolGrade.replace("Year ", ""));

  const { error: profileError } = await profilesTable.insert({
    id: userId,
    name,
    email,
    role,
    profile_code: generateFiveLetterCode(name, codeSeed),
    avatar_url: "/aigenius-logo.png",
  });

  if (profileError) {
    await adminSupabase.auth.admin.deleteUser(userId);
    redirect(withError("/register", profileError.message));
  }

  if (role === "student") {
    const { data: studentProfile, error: studentError } = await studentProfilesTable
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
      redirect(withError("/register", studentError?.message ?? "Unable to create student profile."));
    }

    const { data: pet, error: petError } = await petsTable
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
      redirect(withError("/register", petError?.message ?? "Unable to create starter pet."));
    }

    await studentProfilesTable
      .update({ pet_id: pet.id })
      .eq("id", studentProfile.id);
  }

  const supabase = await createSupabaseServerClient();
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (signInError) {
    const cookieStore = await cookies();
    cookieStore.delete("aigenius_demo_role");
    redirect(withError("/login", "Account created. Please login with your email and password."));
  }

  redirect(getDashboardPath(role));
}
