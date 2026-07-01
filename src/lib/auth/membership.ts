import type { User } from "@supabase/supabase-js";
import { redirect } from "next/navigation";

import {
  AUTH_LOGIN_PATH,
  AUTH_NOT_AUTHORIZED_PATH,
} from "@/lib/auth/routes";
import { createClient } from "@/lib/supabase/server";

export type MemberContext = {
  user: User;
  memberEmail: string;
};

/** Returns true when the user has a row in authorized_users (RLS: read own). */
export async function isAuthorizedMember(userId: string): Promise<boolean> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("authorized_users")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("[isAuthorizedMember]", error.message);
    return false;
  }

  return data != null;
}

/**
 * Requires Supabase Auth session + authorized_users membership.
 * Redirects to /login or /not-authorized when checks fail.
 */
export async function requireAuthorizedMember(
  nextPath = "/dashboard",
): Promise<MemberContext> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`${AUTH_LOGIN_PATH}?next=${encodeURIComponent(nextPath)}`);
  }

  const { data: member, error } = await supabase
    .from("authorized_users")
    .select("email")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    console.error("[requireAuthorizedMember]", error.message);
    redirect(AUTH_NOT_AUTHORIZED_PATH);
  }

  if (!member) {
    redirect(AUTH_NOT_AUTHORIZED_PATH);
  }

  return { user, memberEmail: member.email };
}
