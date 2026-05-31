"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { demoAuthCookieName, findDemoAccount } from "@/lib/demo-auth";
import { createSupabaseServerClient } from "@/lib/supabase-server";

function withError(path: string, message: string) {
  return `${path}?error=${encodeURIComponent(message)}`;
}

export async function adminLoginAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    redirect(withError("/admin/login", "Please enter admin email and password."));
  }

  const demoAccount = findDemoAccount(email, password);
  if (demoAccount) {
    if (demoAccount.role !== "admin") {
      redirect(withError("/admin/login", "This portal is for admins only."));
    }

    const cookieStore = await cookies();
    cookieStore.set(demoAuthCookieName, demoAccount.role, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 8,
    });
    redirect("/admin");
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    redirect(withError("/admin/login", error?.message ?? "Admin login failed."));
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .single<{ role: string }>();

  if (profileError || !profile) {
    await supabase.auth.signOut();
    redirect(withError("/admin/login", "Admin profile not found."));
  }

  if (profile.role !== "admin") {
    await supabase.auth.signOut();
    redirect(withError("/admin/login", "This portal is for admins only."));
  }

  redirect("/admin");
}
