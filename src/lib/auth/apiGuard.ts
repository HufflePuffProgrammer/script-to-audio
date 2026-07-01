import type { SupabaseClient, User } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

/**
 * Returns a JSON 401/403 response when the caller may not use /api/admin/*.
 * Returns null when the user is an authorized member.
 */
export async function adminApiGuardResponse(
  supabase: SupabaseClient,
  user: User | null,
): Promise<NextResponse | null> {
  if (!user) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

  const { data, error } = await supabase
    .from("authorized_users")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    console.error("[adminApiGuardResponse]", error.message);
    return NextResponse.json(
      { ok: false, error: "Forbidden" },
      { status: 403 },
    );
  }

  if (!data) {
    return NextResponse.json(
      { ok: false, error: "Forbidden" },
      { status: 403 },
    );
  }

  return null;
}
