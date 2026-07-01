"use server";

import { redirect } from "next/navigation";

import { AUTH_NOT_AUTHORIZED_PATH } from "@/lib/auth/routes";
import { isAuthorizedMember } from "@/lib/auth/membership";
import { createClient } from "@/lib/supabase/server";

export type LoginState = {
  error?: string;
};

function safeNextPath(next: FormDataEntryValue | null): string {
  const value = typeof next === "string" ? next : "";
  if (!value.startsWith("/") || value.startsWith("//")) {
    return "/dashboard";
  }
  return value;
}

export async function loginAction(
  _prevState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = safeNextPath(formData.get("next"));

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  const userId = data.user?.id;
  if (!userId) {
    return { error: "Sign-in succeeded but no user was returned." };
  }

  const allowed = await isAuthorizedMember(userId);
  if (!allowed) {
    await supabase.auth.signOut();
    redirect(AUTH_NOT_AUTHORIZED_PATH);
  }

  redirect(next);
}

export async function logoutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
