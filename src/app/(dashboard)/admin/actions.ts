"use server";

import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";
import { adminTable } from "@/lib/supabase-admin-tables";

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
