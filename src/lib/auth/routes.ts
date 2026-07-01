/** Route prefixes that require a Supabase Auth session (Step 3 middleware). */
export const AUTH_PROTECTED_PREFIXES = ["/dashboard", "/admin"] as const;

export const AUTH_LOGIN_PATH = "/login";

export const AUTH_NOT_AUTHORIZED_PATH = "/not-authorized";

export function isAuthProtectedPath(pathname: string): boolean {
  return AUTH_PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

/** Admin API routes guarded in middleware (Step 6). */
export function isAdminApiPath(pathname: string): boolean {
  return pathname === "/api/admin" || pathname.startsWith("/api/admin/");
}
