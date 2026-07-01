import { requireAuthorizedMember } from "@/lib/auth/membership";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAuthorizedMember("/admin");
  return children;
}
