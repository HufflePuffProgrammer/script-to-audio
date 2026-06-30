"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

type DbErrorRow = {
  id: string;
  source: string;
  message: string;
  context: Record<string, unknown> | null;
  created_at: string;
};

type LoadStatus = "idle" | "loading" | "ok" | "error";

function formatTimestamp(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }
  return date.toLocaleString();
}

function formatContext(context: Record<string, unknown> | null): string {
  if (context == null) {
    return "—";
  }
  try {
    return JSON.stringify(context, null, 2);
  } catch {
    return String(context);
  }
}

export default function ErrorPage() {
  const [status, setStatus] = useState<LoadStatus>("idle");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<DbErrorRow[]>([]);
  const API_URL = "/api/admin/screenplay-details";

  const loadErrors = useCallback(async () => {
    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch(API_URL);
      const body = await res.json();

      if (!res.ok || !body?.ok) {
        throw new Error(body?.error || `Request failed with ${res.status}`);
      }

      setErrors(body.errors ?? []);
      setStatus("ok");
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Unknown error");
      setErrors([]);
    }
  }, []);

  useEffect(() => {
    void loadErrors();
  }, [loadErrors]);

  return (
    <main className="min-h-screen bg-[#f4f6fb]">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10 lg:px-10">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase text-blue-600">
              Admin
            </p>
            <h1 className="text-2xl font-bold text-slate-900">
              Screenplay Details
            </h1>
           
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => void loadErrors()}
              disabled={status === "loading"}
              className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {status === "loading" ? "Refreshing…" : "Refresh"}
            </button>
            <Link
              href="/admin"
              className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Back to admin
            </Link>
          </div>
        </header>

        {status === "error" && message && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {message}
          </div>
        )}

        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <p className="text-sm font-semibold text-slate-800">
              Latest errors
            </p>
            <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">
              {errors.length} row{errors.length === 1 ? "" : "s"}
            </span>
          </div>

          {status === "loading" && errors.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-slate-500">
              Loading…
            </p>
          ) : errors.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-slate-500">
              No errors logged yet. Trigger one with a bad screenplay id on{" "}
              <code>/api/admin/character-builder</code>, or insert a test row in
              Supabase SQL.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-3">When</th>
                    <th className="px-4 py-3">Source</th>
                    <th className="px-4 py-3">Message</th>
                    <th className="px-4 py-3">Context</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {errors.map((row) => (
                    <tr key={row.id} className="align-top hover:bg-slate-50/80">
                      <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                        {formatTimestamp(row.created_at)}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-slate-800">
                        {row.source}
                      </td>
                      <td className="max-w-md px-4 py-3 text-slate-800">
                        {row.message}
                      </td>
                      <td className="px-4 py-3">
                        {row.context ? (
                          <details className="group">
                            <summary className="cursor-pointer text-xs font-semibold text-blue-600 hover:text-blue-700">
                              View JSON
                            </summary>
                            <pre className="mt-2 max-h-48 overflow-auto rounded bg-slate-50 p-2 text-xs text-slate-700">
                              {formatContext(row.context)}
                            </pre>
                          </details>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
