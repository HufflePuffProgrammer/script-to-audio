import { createClient } from "@supabase/supabase-js";
import ws from "ws";

/** Service-role Supabase client for Node scripts (npm run auth:*, check:auth-*). */
export function createServiceRoleClient(url, serviceKey) {
  return createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
    realtime: { transport: ws },
  });
}
