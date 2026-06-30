"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import type { ScreenplayStatsRow } from "@/lib/types";

type LoadStatus = "idle" | "loading" | "ok" | "error";

const FAILURE_STAGES = new Set([
  "scenes_parse_failed",
  "stats_update_failed",
  "no_scenes_found",
]);

function formatTimestamp(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }
  return date.toLocaleString();
}

function formatCell(value: string | number | null | undefined): string {
  if (value == null || value === "") {
    return "—";
  }
  return String(value);
}

function stageBadgeClass(stage: string | null): string {
  if (stage == null) {
    return "bg-slate-100 text-slate-600";
  }
  if (FAILURE_STAGES.has(stage)) {
    return "bg-red-100 text-red-700";
  }
  if (stage === "scenes_parsed") {
    return "bg-green-100 text-green-700";
  }
  return "bg-amber-100 text-amber-800";
}

export default function ScreenplayStatsPage() {
  const [status, setStatus] = useState<LoadStatus>("idle");
  const [message, setMessage] = useState("");
  const [screenplays, setScreenplays] = useState<ScreenplayStatsRow[]>([]);

  const loadScreenplays = useCallback(async () => {
    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/admin/screenplay-stats");
      const body = await res.json();

      if (!res.ok || !body?.ok) {
        throw new Error(body?.error || `Request failed with ${res.status}`);
      }

      setScreenplays(body.screenplays ?? []);
      setStatus("ok");
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Unknown error");
      setScreenplays([]);
    }
  }, []);

  useEffect(() => {
    void loadScreenplays();
  }, [loadScreenplays]);

  return (
    <main className="min-h-screen bg-[#f4f6fb]">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-10 lg:px-10">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase text-blue-600">
              Admin
            </p>
            <h1 className="text-2xl font-bold text-slate-900">
              Screenplay stats
            </h1>
            <p className="max-w-2xl text-sm text-slate-600">
              Parse progress on <code>screenplays</code>, plus the latest
              matching row from <code>errors</code> when something fails.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => void loadScreenplays()}
              disabled={status === "loading"}
              className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {status === "loading" ? "Refreshing…" : "Refresh"}
            </button>
            <Link
              href="/admin/error-page"
              className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              All errors
            </Link>
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
              Latest screenplays
            </p>
            <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">
              {screenplays.length} screenplay
              {screenplays.length === 1 ? "" : "s"}
            </span>
          </div>

          {status === "loading" && screenplays.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-slate-500">
              Loading…
            </p>
          ) : screenplays.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-slate-500">
              No screenplays yet. Parse one via <code>/api/parse</code> or{" "}
              <code>/admin/parse-screenplay</code>.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Screenplay ID</th>
                    <th className="px-4 py-3">Title</th>
                    <th className="px-4 py-3">Scenes</th>
                    <th className="px-4 py-3">Last scene</th>
                    <th className="px-4 py-3">Characters</th>
                    <th className="px-4 py-3">Stage</th>
                    <th className="px-4 py-3">Last error</th>
                    <th className="px-4 py-3">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {screenplays.map((screenplay) => (
                    <tr
                      key={screenplay.id}
                      className="align-top hover:bg-slate-50/80"
                    >
                      <td className="px-4 py-3 font-mono text-xs text-slate-800">
                        {screenplay.id}
                      </td>
                      <td className="px-4 py-3 text-slate-800">
                        {formatCell(screenplay.title)}
                      </td>
                      <td className="px-4 py-3 text-slate-800">
                        {formatCell(screenplay.scene_count)}
                      </td>
                      <td className="px-4 py-3 text-slate-800">
                        {formatCell(screenplay.last_scene_parsed)}
                      </td>
                      <td className="px-4 py-3 text-slate-800">
                        {formatCell(screenplay.number_of_characters)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${stageBadgeClass(screenplay.stage_of_development)}`}
                        >
                          {formatCell(screenplay.stage_of_development)}
                        </span>
                      </td>
                      <td className="max-w-xs px-4 py-3 text-slate-800">
                        {screenplay.last_error ? (
                          <details>
                            <summary className="cursor-pointer text-xs font-semibold text-red-600 hover:text-red-700">
                              {screenplay.last_error.source}
                            </summary>
                            <p className="mt-1 text-xs text-slate-600">
                              {screenplay.last_error.message}
                            </p>
                            <p className="mt-1 text-xs text-slate-400">
                              {formatTimestamp(screenplay.last_error.created_at)}
                            </p>
                          </details>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                        {formatTimestamp(screenplay.created_at)}
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
