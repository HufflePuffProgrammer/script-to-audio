"use client";

import { useState } from "react";
import Link from "next/link";

type Status = "idle" | "loading" | "ok" | "error";

export default function AdminDbCheck() {
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string>("");

  const runCheck = async () => {
    setStatus("loading");
    setMessage("");
    try {
      const res = await fetch("/api/admin/db-check", { method: "POST" });
      const body = await res.json();
      if (!body?.ok) {
        setStatus("error");
        setMessage(body?.error || "Check failed");
        return;
      }
      setStatus("ok");
      setMessage("Supabase connection OK.");
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Unknown error");
    }
  };

  return (
    <main className="min-h-screen bg-white text-gray-900 px-6 py-10">
      <div className="mx-auto flex max-w-3xl flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-semibold text-blue-600 uppercase">Admin</p>
            <h1 className="text-3xl font-bold">Supabase DB check</h1>
            <p className="text-sm text-gray-600">
              Verifies connectivity using the service role key. Ensure env vars are set and tables exist.
            </p>
          </div>
          <Link
            href="/steps/audio"
            className="rounded-full border border-gray-200 px-3 py-1 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            Back to app
          </Link>
        </div>

        <section className="rounded-lg border border-gray-200 p-4 space-y-3">
          <button
            type="button"
            onClick={runCheck}
            disabled={status === "loading"}
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-60"
          >
            {status === "loading" ? "Checking..." : "Run DB check"}
          </button>

          {message && (
            <div
              className={`rounded-md border px-3 py-2 text-sm ${
                status === "error"
                  ? "border-red-200 bg-red-50 text-red-700"
                  : "border-green-200 bg-green-50 text-green-700"
              }`}
            >
              {message}
            </div>
          )}

          {status === "idle" && !message && (
            <p className="text-sm text-gray-600">No checks run yet.</p>
          )}
        </section>
      </div>
    </main>
  );
}

