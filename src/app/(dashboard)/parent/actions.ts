"use server";

import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";
import { adminTable } from "@/lib/supabase-admin-tables";
import { normalizeReferralCode } from "@/lib/referrals";

type StudentCodeLookup = {
  id: string;
  parent_ids: string[];
};

function withMessage(path: string, key: "status" | "error", message: string) {
  return `${path}?${key}=${encodeURIComponent(message)}`;
}

export async function addChildByCodeAction(formData: FormData) {
  const profile = await getCurrentProfile();

  if (!profile || profile.role !== "parent") {
    redirect(withMessage("/parent", "error", "Please login as a parent first."));
  }

  const code = normalizeReferralCode(String(formData.get("studentCode") ?? ""));

  if (code.length !== 5) {
    redirect(withMessage("/parent", "error", "Enter your child's 5-letter student code."));
  }

  const { data: student, error: lookupError } = await adminTable("student_profiles")
    .select("id,parent_ids")
    .eq("referral_code", code)
    .maybeSingle<StudentCodeLookup>();

  if (lookupError || !student) {
    redirect(withMessage("/parent", "error", "Student code not found."));
  }

  const { error: linkError } = await adminTable("parent_student_links").upsert(
    {
      parent_id: profile.id,
      student_id: student.id,
      status: "active",
      source: "student_code",
    },
    { onConflict: "parent_id,student_id" },
  );

  if (linkError) {
    redirect(withMessage("/parent", "error", linkError.message));
  }

  const parentIds = Array.from(new Set([...(student.parent_ids ?? []), profile.id]));
  await adminTable("student_profiles").update({ parent_ids: parentIds }).eq("id", student.id);

  redirect(withMessage("/parent", "status", "Child linked. You can now monitor progress."));
}
