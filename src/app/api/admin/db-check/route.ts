import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabaseServer";

export async function POST() {
  try {
    const supabase = getSupabaseAdminClient();
    if (!supabase) {
      return NextResponse.json(
        { ok: false, error: "Supabase env vars missing" },
        { status: 200 }
      );
    }

    // Lightweight connectivity check: head request with count
    const { error,id,count } = await supabase
      .from("screenplays")
      .select("id", { count: "exact", head: true })
      .limit(1);
console.log("id",id);
console.log("count",count);
    if (error) {
      return NextResponse.json(
        {
          ok: false,
          error: error.message,
          details: error,
        },
        { status: 200 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("DB check error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

