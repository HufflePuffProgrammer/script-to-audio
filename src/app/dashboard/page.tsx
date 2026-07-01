import Link from "next/link";

import { logoutAction } from "@/app/login/actions";
import { requireAuthorizedMember } from "@/lib/auth/membership";

const memberLinks = [
  {
    href: "/admin",
    title: "Admin utilities",
    description: "DB check, health, parse, character builder, and more.",
  },
  {
    href: "/admin/screenplay-stats",
    title: "Screenplay stats",
    description: "Parse progress and error state per screenplay.",
  },
  {
    href: "/admin/error-page",
    title: "Error log",
    description: "Recent rows from the errors table.",
  },
  {
    href: "/demo",
    title: "Demo workflow",
    description: "Paste → parse → character → audio pipeline.",
  },
];

export default async function DashboardPage() {
  const { user, memberEmail } = await requireAuthorizedMember("/dashboard");

  return (
    <main className="min-h-screen bg-[#f4f6fb] px-6 py-10">
      <div className="mx-auto flex max-w-3xl flex-col gap-6">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1">
            <p className="text-sm font-semibold uppercase text-green-600">
              Member dashboard
            </p>
            <h1 className="text-2xl font-bold text-slate-900">Welcome</h1>
            <p className="text-sm text-slate-600">
              Signed in as <strong>{user.email ?? memberEmail}</strong>
            </p>
            <p className="text-xs text-slate-500">
              Membership verified via <code>authorized_users</code>.
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

        <section className="grid gap-3 sm:grid-cols-2">
          {memberLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-blue-200 hover:shadow-md"
            >
              <p className="text-sm font-semibold text-slate-900">{link.title}</p>
              <p className="mt-1 text-xs text-slate-600">{link.description}</p>
            </Link>
          ))}
        </section>
      </div>
    </main>
  );
}
