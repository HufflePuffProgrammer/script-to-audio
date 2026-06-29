import { getSupabaseAdminClient } from "@/lib/supabaseServer";

export type DbErrorContext = Record<string, unknown>;

/**
 * Persists a server-side failure to the `errors` table (service role).
 * Falls back to console.error if Supabase is unavailable or the insert fails.
 */
export async function logDbError(
  source: string,
  message: string,
  context?: DbErrorContext,
): Promise<void> {
  console.error(`[${source}]`, message, context ?? "");

  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    return;
  }

  const { error } = await supabase.from("errors").insert({
    source,
    message,
    context: context ?? null,
  });

  if (error) {
    console.error(`[${source}] failed to persist error log:`, error.message);
  }
}
