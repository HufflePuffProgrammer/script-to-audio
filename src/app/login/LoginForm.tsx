"use client";

import Link from "next/link";
import { useActionState } from "react";

import { loginAction, type LoginState } from "@/app/login/actions";

type LoginFormProps = {
  nextPath: string;
};

const initialState: LoginState = {};

export function LoginForm({ nextPath }: LoginFormProps) {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="next" value={nextPath} />

      <div className="space-y-1">
        <label htmlFor="email" className="text-sm font-medium text-slate-700">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          disabled={pending}
          className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none ring-blue-500 focus:ring-2 disabled:opacity-60"
          placeholder="you@example.com"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="password" className="text-sm font-medium text-slate-700">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          disabled={pending}
          className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none ring-blue-500 focus:ring-2 disabled:opacity-60"
        />
      </div>

      {state.error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </div>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>

      <p className="text-center text-xs text-slate-500">
        After sign-in you go to{" "}
        <code className="rounded bg-slate-100 px-1">{nextPath}</code>
      </p>

      <Link
        href="/"
        className="block text-center text-sm font-semibold text-blue-600 hover:text-blue-700"
      >
        ← Back to home
      </Link>
    </form>
  );
}
