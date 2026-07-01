import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import {
  AUTH_DASHBOARD_PATH,
  AUTH_LOGIN_PATH,
  AUTH_NOT_AUTHORIZED_PATH,
  isAdminApiPath,
  isAdminProtectedPath,
  isAuthProtectedPath,
  isMemberApiPath,
} from "@/lib/auth/routes";
import { adminApiGuardResponse, memberApiGuardResponse } from "@/lib/auth/apiGuard";
import { isAdministrator, parseUserRole } from "@/lib/auth/roles";

export async function updateSession(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          supabaseResponse.cookies.set(name, value, options);
        });
      },
    },
  });

  // Refresh session; do not trust getSession() alone in server code.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isProtected = isAuthProtectedPath(pathname);
  const isLogin = pathname === AUTH_LOGIN_PATH;

  if (isMemberApiPath(pathname)) {
    const blocked = await memberApiGuardResponse(supabase, user);
    if (blocked) {
      return blocked;
    }
  }

  if (isAdminApiPath(pathname)) {
    const blocked = await adminApiGuardResponse(supabase, user);
    if (blocked) {
      return blocked;
    }
  }

  if (isProtected && !user) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = AUTH_LOGIN_PATH;
    redirectUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (isProtected && user) {
    const { data: member, error: memberError } = await supabase
      .from("authorized_users")
      .select("user_id, role")
      .eq("user_id", user.id)
      .maybeSingle();

    if (memberError || !member) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = AUTH_NOT_AUTHORIZED_PATH;
      return NextResponse.redirect(redirectUrl);
    }

    if (
      isAdminProtectedPath(pathname) &&
      !isAdministrator(parseUserRole(member.role))
    ) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = AUTH_DASHBOARD_PATH;
      return NextResponse.redirect(redirectUrl);
    }
  }

  if (isLogin && user) {
    const redirectUrl = request.nextUrl.clone();
    const nextPath = redirectUrl.searchParams.get("next") || "/dashboard";
    redirectUrl.pathname = nextPath.startsWith("/") ? nextPath : "/dashboard";
    redirectUrl.searchParams.delete("next");
    return NextResponse.redirect(redirectUrl);
  }

  return supabaseResponse;
}
