import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { supabaseConfig } from "./supabase";

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  if (!supabaseConfig.url || !supabaseConfig.publishableKey) {
    throw new Error("Supabase is not configured.");
  }

  return createServerClient(supabaseConfig.url, supabaseConfig.publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          cookieStore.set(name, value, options);
        });
      },
    },
  });
}
