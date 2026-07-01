import Link from "next/link";

import { logoutAction } from "@/app/login/actions";

export default function NotAuthorizedPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f4f6fb] px-6">
      <div className="w-full max-w-md space-y-4 rounded-xl border border-amber-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase text-amber-600">
          Access denied
        </p>
        <h1 className="text-2xl font-bold text-slate-900">Not a member</h1>
        <p className="text-sm text-slate-600">
          Your account signed in successfully, but it is not on the{" "}
          <code>authorized_users</code> allowlist. Ask an admin to run:
        </p>
        <pre className="overflow-x-auto rounded-md bg-slate-50 p-3 text-xs text-slate-800">
          npm run auth:add-member -- your@email.com
        </pre>
        <div className="flex flex-wrap gap-2">
          <form action={logoutAction}>
            <button
              type="submit"
              className="rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Sign out
            </button>
          </form>
          <Link
            href="/"
            className="rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Home
          </Link>
        </div>
      </div>
    </main>
  );
}
