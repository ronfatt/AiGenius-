import type { UserRole } from "./types";
import { createSupabaseServerClient } from "./supabase-server";

export type AuthProfile = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  centre_id: string | null;
};

export function getRoleDashboardPath(role: UserRole) {
  const paths: Record<UserRole, string> = {
    admin: "/admin",
    teacher: "/teacher",
    student: "/student",
    parent: "/parent",
  };

  return paths[role];
}

export async function getCurrentProfile() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("id,name,email,role,centre_id")
    .eq("id", user.id)
    .single<AuthProfile>();

  if (error || !data) return null;

  return data;
}
