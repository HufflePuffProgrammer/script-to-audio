import { NextResponse } from "next/server";
import { logDbError } from "@/lib/db/logError";
import { getSupabaseAdminClient } from "@/lib/supabaseServer";

const TEST_SOURCE = "errorsTestRoute";

async function runTest() {
  const message = "Predictable test error from /api/admin/errors/test";
  const context = {
    triggered_at: new Date().toISOString(),
    note: "Safe to delete; verifies logDbError → errors table",
  };

  await logDbError(TEST_SOURCE, message, context);

  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    return NextResponse.json(
      {
        ok: false,
        error: "Supabase env vars missing; message logged to console only",
      },
      { status: 503 },
    );
  }

  const { data, error } = await supabase
    .from("errors")
    .select("id, source, message, context, created_at")
    .eq("source", TEST_SOURCE)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 },
    );
  }

  if (!data) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "logDbError ran but no row was found (check errors table and RLS policies)",
      },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true, row: data });
}

/** POST — trigger a test error row (preferred). */
export async function POST() {
  return runTest();
}

/** GET — same as POST for quick browser/curl checks in dev. */
export async function GET() {
  return runTest();
}
