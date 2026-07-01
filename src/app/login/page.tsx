import { LoginForm } from "@/app/login/LoginForm";

function resolveNextPath(next?: string): string {
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return "/dashboard";
  }
  return next;
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const params = await searchParams;
  const nextPath = resolveNextPath(params?.next);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f4f6fb] px-6">
      <div className="w-full max-w-md space-y-4 rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="space-y-1">
          <p className="text-sm font-semibold uppercase text-blue-600">Auth</p>
          <h1 className="text-2xl font-bold text-slate-900">Sign in</h1>
          <p className="text-sm text-slate-600">
            Use your Supabase Auth account. Membership is checked on the
            dashboard in Step 5.
          </p>
        </div>

        <LoginForm nextPath={nextPath} />
      </div>
    </main>
  );
}
