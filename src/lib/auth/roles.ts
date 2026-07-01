/** App roles stored on `authorized_users.role`. */
export const USER_ROLES = ["administrator", "user", "test"] as const;

export type UserRole = (typeof USER_ROLES)[number];

export function isAdministrator(role: UserRole): boolean {
  return role === "administrator";
}

export function isTestUser(role: UserRole): boolean {
  return role === "test";
}

/** Coerce DB value to a known role (defaults to `user`). */
export function parseUserRole(value: string | null | undefined): UserRole {
  if (value === "administrator" || value === "test") {
    return value;
  }
  return "user";
}

export function roleDisplayName(role: UserRole): string {
  switch (role) {
    case "administrator":
      return "Administrator";
    case "test":
      return "Test user";
    default:
      return "User";
  }
}
