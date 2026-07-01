import type { User } from "@supabase/supabase-js";
import { redirect } from "next/navigation";

import {
  isAdministrator,
  parseUserRole,
  type UserRole,
} from "@/lib/auth/roles";
import {
  AUTH_DASHBOARD_PATH,
  AUTH_LOGIN_PATH,
  AUTH_NOT_AUTHORIZED_PATH,
} from "@/lib/auth/routes";
import { createClient } from "@/lib/supabase/server";

export type MemberContext = {
  user: User;
  memberEmail: string;
  role: UserRole;
};

async function loadMember(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("authorized_users")
    .select("email, role")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("[loadMember]", error.message);
    return null;
  }

  if (!data) {
    return null;
  }

  return {
    memberEmail: data.email,
    role: parseUserRole(data.role),
  };
}

/** Returns true when the user has a row in authorized_users (RLS: read own). */
export async function isAuthorizedMember(userId: string): Promise<boolean> {
  const member = await loadMember(userId);
  return member != null;
}

/**
 * Requires Supabase Auth session + authorized_users membership.
 * Redirects to /login or /not-authorized when checks fail.
 */
export async function requireAuthorizedMember(
  nextPath = AUTH_DASHBOARD_PATH,
): Promise<MemberContext> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`${AUTH_LOGIN_PATH}?next=${encodeURIComponent(nextPath)}`);
  }

  const member = await loadMember(user.id);

  if (!member) {
    redirect(AUTH_NOT_AUTHORIZED_PATH);
  }

  return { user, memberEmail: member.memberEmail, role: member.role };
}

/**
 * Requires administrator role. Non-admins are sent to the dashboard.
 */
export async function requireAdministrator(
  nextPath = "/admin",
): Promise<MemberContext> {
  const context = await requireAuthorizedMember(nextPath);

  if (!isAdministrator(context.role)) {
    redirect(AUTH_DASHBOARD_PATH);
  }

  return context;
}
