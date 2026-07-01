import { requireAuthorizedMember } from "@/lib/auth/membership";

/** Auth layout — skip static prerender at build (needs Supabase env + session). */
export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAuthorizedMember("/dashboard");
  return children;
}
