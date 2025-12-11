import { createClient, SupabaseClient } from "@supabase/supabase-js";

let adminClient: SupabaseClient | null = null;

export const getSupabaseAdminClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    console.warn("Supabase env vars missing; skipping persistence.");
    return null;
  }

  if (!adminClient) {
    adminClient = createClient(url, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }

  return adminClient;
};

