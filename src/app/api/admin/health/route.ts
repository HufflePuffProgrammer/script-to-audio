import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabaseServer";
import { getElevenLabsClient } from "@/lib/elevenlabsClient";

export async function GET() {
  const result = {
    supabase: { ok: true, error: null as string | null },
    elevenlabs: { ok: true, error: null as string | null },
  };

  // Supabase check
  try {
    const supabase = getSupabaseAdminClient();
    if (!supabase) {
      result.supabase.ok = false;
      result.supabase.error = "Supabase env vars missing";
    } else {
      const { error } = await supabase
        .from("screenplays")
        .select("id", { count: "exact", head: true })
        .limit(1);
      if (error) {
        result.supabase.ok = false;
        result.supabase.error = error.message;
      }
    }
  } catch (err) {
    result.supabase.ok = false;
    result.supabase.error = err instanceof Error ? err.message : "Unknown error";
  }

  // ElevenLabs check (lightweight: fetch voices list)
  try {
    const client = getElevenLabsClient();
    const voices = await client.voices.list({ page_size: 1 });
    if (!voices?.voices) {
      result.elevenlabs.ok = false;
      result.elevenlabs.error = "No voices returned";
    }
  } catch (err) {
    result.elevenlabs.ok = false;
    result.elevenlabs.error = err instanceof Error ? err.message : "Unknown error";
  }

  const status = result.supabase.ok && result.elevenlabs.ok ? 200 : 503;

  return NextResponse.json(result, { status });
}

