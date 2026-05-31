import { createClient } from "@supabase/supabase-js";

export const supabaseConfig = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  publishableKey:
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    "",
};

let browserClient: ReturnType<typeof createClient> | null = null;
let serviceRoleClient: ReturnType<typeof createClient> | null = null;

export function isSupabaseConfigured() {
  return Boolean(supabaseConfig.url && supabaseConfig.publishableKey);
}

export function getSupabaseSetupMessage() {
  if (isSupabaseConfigured()) {
    return "Supabase environment variables are configured.";
  }

  return "Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY before enabling Supabase.";
}

export function getSupabaseBrowserClient() {
  if (!isSupabaseConfigured()) {
    throw new Error(getSupabaseSetupMessage());
  }

  if (!browserClient) {
    browserClient = createClient(supabaseConfig.url, supabaseConfig.publishableKey);
  }

  return browserClient;
}

export function getSupabaseServerClient() {
  if (!isSupabaseConfigured()) {
    throw new Error(getSupabaseSetupMessage());
  }

  return createClient(supabaseConfig.url, supabaseConfig.publishableKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export function getSupabaseServiceRoleClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

  if (!supabaseConfig.url || !serviceRoleKey) {
    throw new Error("Add NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY before using admin Supabase operations.");
  }

  if (!serviceRoleClient) {
    serviceRoleClient = createClient(supabaseConfig.url, serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }

  return serviceRoleClient;
}
