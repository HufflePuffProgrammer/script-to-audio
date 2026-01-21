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

  const statusBadge = () => {
    if (status === "loading") return <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-700">Running…</span>;
    if (status === "ok") return <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-700">OK</span>;
    if (status === "error") return <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-semibold text-red-700">Error</span>;
    return <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">Idle</span>;
  };

  return (
    <main className="min-h-screen bg-[#f7f9fc] text-gray-900 px-6 py-10">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <p className="text-sm font-semibold text-blue-600 uppercase">Admin</p>
            <h1 className="text-3xl font-bold">Utilities</h1>
            <p className="text-sm text-gray-600">
              Quick checks for Supabase and ElevenLabs. Ensure env vars are set before running these tools.
            </p>
          </div>
          <Link
            href="/steps/audio"
            className="rounded-full border border-gray-200 px-3 py-1 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            Back to app
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-gray-800">Supabase connectivity</p>
                <p className="text-xs text-gray-600">
                  Uses service role; confirms tables are reachable.
                </p>
              </div>
              {statusBadge()}
            </div>
            <div className="mt-3 flex items-center gap-3">
              <button
                type="button"
                onClick={runCheck}
                disabled={status === "loading"}
                className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-3 py-2 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-60"
              >
                {status === "loading" ? "Checking..." : "Run DB check"}
              </button>
              {message && (
                <span
                  className={`text-xs ${
                    status === "error" ? "text-red-600" : "text-green-700"
                  }`}
                >
                  {message}
                </span>
              )}
            </div>
          </section>

          <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm space-y-2">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-gray-800">API health</p>
                <p className="text-xs text-gray-600">
                  Calls both Supabase and ElevenLabs via `/api/admin/health`.
                </p>
              </div>
              <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
                Link
              </span>
            </div>
            <div className="flex gap-3">
              <Link
                href="/api/admin/health"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-md border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Open health API
              </Link>
            </div>
          </section>

          <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm space-y-2">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-gray-800">ElevenLabs debug UI</p>
                <p className="text-xs text-gray-600">
                  Runs a sample `/api/generate-audio` request and plays the result.
                </p>
              </div>
              <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
                UI
              </span>
            </div>
            <div className="flex gap-3">
              <Link
                href="/admin/debug"
                className="inline-flex items-center gap-2 rounded-md border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Open debug page
              </Link>
            </div>
          </section>

          <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm space-y-2">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-gray-800">Generate audio API</p>
                <p className="text-xs text-gray-600">
                  POST `/api/generate-audio` with scene_id + dialogue; stores audio in Supabase.
                </p>
              </div>
              <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
                API
              </span>
            </div>
            <div className="flex gap-3">
              <Link
                href="/steps/audio"
                className="inline-flex items-center gap-2 rounded-md border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Go to audio staging
              </Link>
            </div>
          </section>

          <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm space-y-2">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-gray-800">Character Builder</p>
                <p className="text-xs text-gray-600">
                  POST `/api/build-character` with scene_id + dialogue; stores audio in Supabase.
                </p>
              </div>
              <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
                API
              </span>
            </div>
            <div className="flex gap-3">
              <Link
                href="/admin/character-builder"
                className="inline-flex items-center gap-2 rounded-md border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Go to character builder
              </Link>
            </div>
          </section>
          <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm space-y-2">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-gray-800">Parse Script</p>
                <p className="text-xs text-gray-600">
                  calls @lib/parseScript.ts to parse the script and store the scenes in the database.
                </p>
              </div>
              <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
                Link
              </span>
            </div>
            <div className="flex gap-3">
              <Link
                href="/admin/paste"

                className="inline-flex items-center gap-2 rounded-md border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Go to paste text
              </Link>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

