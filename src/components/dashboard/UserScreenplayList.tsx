import Link from "next/link";

import type { ScreenplayStatsRow } from "@/lib/types";

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

type UserScreenplayListProps = {
  screenplays: ScreenplayStatsRow[];
  emptyHint?: string;
};

export function UserScreenplayList({
  screenplays,
  emptyHint,
}: UserScreenplayListProps) {
  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-4 py-3">
        <p className="text-sm font-semibold text-slate-800">Your screenplays</p>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">
            {screenplays.length} screenplay
            {screenplays.length === 1 ? "" : "s"}
          </span>
          <Link
            href="/dashboard/parse"
            className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            Parse new
          </Link>
        </div>
      </div>

      {screenplays.length === 0 ? (
        <p className="px-4 py-8 text-center text-sm text-slate-500">
          {emptyHint ??
            "No screenplays yet. Use Parse new to add one to your account."}
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Scenes</th>
                <th className="px-4 py-3">Characters</th>
                <th className="px-4 py-3">Stage</th>
                <th className="px-4 py-3">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {screenplays.map((screenplay) => (
                <tr
                  key={screenplay.id}
                  className="align-top hover:bg-slate-50/80"
                >
                  <td className="px-4 py-3 text-slate-800">
                    <p className="font-medium">{formatCell(screenplay.title)}</p>
                    <p className="mt-0.5 font-mono text-xs text-slate-400">
                      {screenplay.id}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-slate-800">
                    {formatCell(screenplay.scene_count)}
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
  );
}
