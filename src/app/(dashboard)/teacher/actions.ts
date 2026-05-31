"use server";

import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";
import { adminTable } from "@/lib/supabase-admin-tables";
import { normalizeReferralCode } from "@/lib/referrals";

type StudentCodeLookup = {
  id: string;
};

function withMessage(path: string, key: "status" | "error", message: string) {
  return `${path}?${key}=${encodeURIComponent(message)}`;
}

export async function addStudentByCodeAction(formData: FormData) {
  const profile = await getCurrentProfile();

  if (!profile || profile.role !== "teacher") {
    redirect(withMessage("/teacher", "error", "Please login as a teacher first."));
  }

  const code = normalizeReferralCode(String(formData.get("studentCode") ?? ""));

  if (code.length !== 5) {
    redirect(withMessage("/teacher", "error", "Enter a 5-letter student code."));
  }

  const { data: student, error: lookupError } = await adminTable("student_profiles")
    .select("id")
    .eq("referral_code", code)
    .maybeSingle<StudentCodeLookup>();

  if (lookupError || !student) {
    redirect(withMessage("/teacher", "error", "Student code not found."));
  }

  const { error: linkError } = await adminTable("teacher_student_links").upsert(
    {
      teacher_id: profile.id,
      student_id: student.id,
      status: "active",
      source: "student_code",
    },
    { onConflict: "teacher_id,student_id" },
  );

  if (linkError) {
    redirect(withMessage("/teacher", "error", linkError.message));
  }

  redirect(withMessage("/teacher", "status", "Student added to your monitor group."));
}
