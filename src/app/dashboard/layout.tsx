import { requireAuthorizedMember } from "@/lib/auth/membership";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAuthorizedMember("/dashboard");
  return children;
}
