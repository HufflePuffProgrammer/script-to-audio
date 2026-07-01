import Link from "next/link";

import { logoutAction } from "@/app/login/actions";
import { UserScreenplayList } from "@/components/dashboard/UserScreenplayList";
import { isAdministrator, roleDisplayName } from "@/lib/auth/roles";
import { requireAuthorizedMember } from "@/lib/auth/membership";
import { getScreenplayStatsForOwner } from "@/lib/db/data";

const adminLinks = [
  {
    href: "/admin",
    title: "Admin utilities",
    description: "DB check, health, parse, character builder, and more.",
  },
  {
    href: "/admin/screenplay-stats",
    title: "Screenplay stats",
    description: "Parse progress and error state for all screenplays.",
  },
];

export default async function DashboardPage() {
  const { user, memberEmail, role } =
    await requireAuthorizedMember("/dashboard");

  const screenplays = isAdministrator(role)
    ? []
    : await getScreenplayStatsForOwner(user.id, 50);

  return (
    <main className="min-h-screen bg-[#f4f6fb] px-6 py-10">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1">
            <p className="text-sm font-semibold uppercase text-green-600">
              {roleDisplayName(role)} dashboard
            </p>
            <h1 className="text-2xl font-bold text-slate-900">Welcome</h1>
            <p className="text-sm text-slate-600">
              Signed in as <strong>{user.email ?? memberEmail}</strong>
            </p>
          </div>
          <form action={logoutAction}>
            <button
              type="submit"
              className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Sign out
            </button>
          </form>
        </header>

        {isAdministrator(role) ? (
          <section className="grid gap-3 sm:grid-cols-2">
            {adminLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-blue-200 hover:shadow-md"
              >
                <p className="text-sm font-semibold text-slate-900">
                  {link.title}
                </p>
                <p className="mt-1 text-xs text-slate-600">
                  {link.description}
                </p>
              </Link>
            ))}
          </section>
        ) : (
          <UserScreenplayList
            screenplays={screenplays}
            emptyHint={
              role === "test"
                ? "No test screenplays yet. Use Parse new on your dashboard to add one."
                : undefined
            }
          />
        )}
      </div>
    </main>
  );
}
