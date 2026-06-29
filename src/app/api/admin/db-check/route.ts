import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabaseServer";

async function probeTable(
  table: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    return { ok: false, error: "Supabase env vars missing" };
  }

  const { error } = await supabase
    .from(table)
    .select("id", { count: "exact", head: true })
    .limit(1);

  if (error) {
    return { ok: false, error: error.message };
  }
  return { ok: true };
}

export async function POST() {
  try {
    const supabase = getSupabaseAdminClient();
    if (!supabase) {
      return NextResponse.json(
        { ok: false, error: "Supabase env vars missing" },
        { status: 200 },
      );
    }

    const tables = ["screenplays", "errors"] as const;
    const results: Record<string, { ok: boolean; error?: string }> = {};

    for (const table of tables) {
      const result = await probeTable(table);
      results[table] = result.ok
        ? { ok: true }
        : { ok: false, error: result.error };
    }

    const allOk = Object.values(results).every((r) => r.ok);
    if (!allOk) {
      const firstError = Object.entries(results).find(([, r]) => !r.ok);
      return NextResponse.json(
        {
          ok: false,
          error: firstError
            ? `${firstError[0]}: ${firstError[1].error}`
            : "Table check failed",
          tables: results,
        },
        { status: 200 },
      );
    }

    return NextResponse.json({ ok: true, tables: results });
  } catch (error) {
    console.error("DB check error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
