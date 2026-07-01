import { requireAdministrator } from "@/lib/auth/membership";

/** Auth layout — skip static prerender at build (needs Supabase env + session). */
export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdministrator("/admin");
  return children;
}
