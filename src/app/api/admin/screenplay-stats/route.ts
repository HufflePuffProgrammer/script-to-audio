import { NextResponse } from "next/server";
import { getScreenplayStats } from "@/lib/db/data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsedLimit = Number.parseInt(searchParams.get("limit") ?? "50", 10);
  const limit = Number.isFinite(parsedLimit)
    ? Math.min(Math.max(parsedLimit, 1), 200)
    : 50;

  try {
    const screenplays = await getScreenplayStats(limit);
    return NextResponse.json({
      ok: true,
      screenplays,
      count: screenplays.length,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
