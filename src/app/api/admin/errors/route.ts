import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabaseServer";

export type DbErrorRow = {
  id: string;
  source: string;
  message: string;
  context: Record<string, unknown> | null;
  created_at: string;
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsedLimit = Number.parseInt(searchParams.get("limit") ?? "50", 10);
  const limit = Number.isFinite(parsedLimit)
    ? Math.min(Math.max(parsedLimit, 1), 200)
    : 50;

  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    return NextResponse.json(
      { ok: false, error: "Supabase env vars missing" },
      { status: 503 },
    );
  }

  const { data, error } = await supabase
    .from("errors")
    .select("id, source, message, context, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 },
    );
  }

  return NextResponse.json({
    ok: true,
    errors: (data ?? []) as DbErrorRow[],
    count: data?.length ?? 0,
  });
}
