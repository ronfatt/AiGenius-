"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getRoleDashboardPath } from "@/lib/auth";
import { demoAuthCookieName, findDemoAccount } from "@/lib/demo-auth";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import type { UserRole } from "@/lib/types";

function withError(path: string, message: string) {
  return `${path}?error=${encodeURIComponent(message)}`;
}

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    redirect(withError("/login", "Please enter email and password."));
  }

  const demoAccount = findDemoAccount(email, password);
  if (demoAccount) {
    if (demoAccount.role === "admin") {
      redirect(withError("/admin/login", "Please use the admin portal."));
    }

    const cookieStore = await cookies();
    cookieStore.set(demoAuthCookieName, demoAccount.role, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 8,
    });
    redirect(demoAccount.dashboardPath);
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    redirect(withError("/login", error?.message ?? "Login failed."));
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .single<{ role: UserRole }>();

  if (profileError || !profile) {
    await supabase.auth.signOut();
    redirect(withError("/login", "Profile not found. Please contact AiGenius admin."));
  }

  if (profile.role === "admin") {
    await supabase.auth.signOut();
    redirect(withError("/admin/login", "Please use the admin portal."));
  }

  redirect(getRoleDashboardPath(profile.role));
}
