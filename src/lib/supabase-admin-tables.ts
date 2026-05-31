import { getSupabaseServiceRoleClient } from "./supabase";

export type SupabaseMutationError = {
  message: string;
};

type SelectQuery = {
  eq: (column: string, value: unknown) => SelectQuery;
  single: <T>() => Promise<{ data: T | null; error: SupabaseMutationError | null }>;
  maybeSingle: <T>() => Promise<{ data: T | null; error: SupabaseMutationError | null }>;
};

type InsertResult = PromiseLike<{ error: SupabaseMutationError | null }> & {
  select: (columns: string) => SelectQuery;
};

type UpsertResult = PromiseLike<{ error: SupabaseMutationError | null }>;

type UpdateResult = {
  eq: (column: string, value: unknown) => Promise<{ error: SupabaseMutationError | null }>;
};

export type SupabaseAdminTable = {
  select: (columns: string) => SelectQuery;
  insert: (values: Record<string, unknown> | Record<string, unknown>[]) => InsertResult;
  upsert: (
    values: Record<string, unknown> | Record<string, unknown>[],
    options?: Record<string, unknown>,
  ) => UpsertResult;
  update: (values: Record<string, unknown>) => UpdateResult;
};

export function adminTable(tableName: string) {
  return getSupabaseServiceRoleClient().from(tableName) as unknown as SupabaseAdminTable;
}
