import type { SupabaseClient, User } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

import { isAdministrator, parseUserRole } from "@/lib/auth/roles";

async function loadMember(
  supabase: SupabaseClient,
  userId: string,
) {
  const { data, error } = await supabase
    .from("authorized_users")
    .select("user_id, role")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("[loadMember]", error.message);
    return null;
  }

  return data;
}

/**
 * Returns a JSON 401/403 response when the caller may not use /api/member/*.
 * Returns null when the user is any authorized member.
 */
export async function memberApiGuardResponse(
  supabase: SupabaseClient,
  user: User | null,
): Promise<NextResponse | null> {
  if (!user) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

  const member = await loadMember(supabase, user.id);

  if (!member) {
    return NextResponse.json(
      { ok: false, error: "Forbidden" },
      { status: 403 },
    );
  }

  return null;
}

/**
 * Returns a JSON 401/403 response when the caller may not use /api/admin/*.
 * Returns null when the user is an administrator.
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

  const member = await loadMember(supabase, user.id);

  if (!member || !isAdministrator(parseUserRole(member.role))) {
    return NextResponse.json(
      { ok: false, error: "Forbidden" },
      { status: 403 },
    );
  }

  return null;
}
