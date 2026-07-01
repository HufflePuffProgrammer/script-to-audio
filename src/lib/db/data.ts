import { getSupabaseAdminClient } from "@/lib/supabaseServer";
import { logDbError } from "@/lib/db/logError";
import {
  ScreenplayStatsDbRow,
  ScreenplayStatsLastError,
  ScreenplayStatsRow,
} from "@/lib/types";

/** Row shape returned from `screenplays` table selects. */
export type ScreenplayDbRow = {
  id: string;
  title: string | null;
  raw_text: string | null;
  created_at: string;
};

function screenplayIdFromErrorContext(
  context: unknown,
): string | null {
  if (context == null || typeof context !== "object") {
    return null;
  }
  const screenplayId = (context as Record<string, unknown>).screenplay_id;
  return typeof screenplayId === "string" ? screenplayId : null;
}

async function attachRecentErrors(
  screenplays: ScreenplayStatsDbRow[],
): Promise<ScreenplayStatsRow[]> {
  if (screenplays.length === 0) {
    return [];
  }

  const serverClient = getSupabaseAdminClient();
  if (!serverClient) {
    return screenplays.map((row) => ({ ...row, last_error: null }));
  }

  const { data: errorRows, error } = await serverClient
    .from("errors")
    .select("source, message, context, created_at")
    .order("created_at", { ascending: false })
    .limit(500);

  if (error) {
    await logDbError("attachRecentErrors", error.message, { code: error.code });
    return screenplays.map((row) => ({ ...row, last_error: null }));
  }

  const lastErrorByScreenplay = new Map<string, ScreenplayStatsLastError>();
  for (const row of errorRows ?? []) {
    const screenplayId = screenplayIdFromErrorContext(row.context);
    if (!screenplayId || lastErrorByScreenplay.has(screenplayId)) {
      continue;
    }
    lastErrorByScreenplay.set(screenplayId, {
      source: row.source,
      message: row.message,
      created_at: row.created_at,
    });
  }

  return screenplays.map((row) => ({
    ...row,
    last_error: lastErrorByScreenplay.get(row.id) ?? null,
  }));
}

export async function verifyVoiceIdExists(
  screenplayId: string,
  characterName: string,
): Promise<boolean> {
  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    throw new Error("Supabase is not configured");
  }
  const { data: existing, error } = await supabase
    .from("character_voices")
    .select("voice_id")
    .eq("screenplay_id", screenplayId)
    .eq("character", characterName)
    .maybeSingle();

  if (error) {
    await logDbError("verifyVoiceIdExists", error.message, {
      screenplay_id: screenplayId,
      character: characterName,
      code: error.code,
    });
    throw new Error("Failed to verify voice id");
  }

  if (existing != null) {
    return true;
  }
  return false;
}

export async function getScreenplayData(
  screenplayId: string,
): Promise<ScreenplayDbRow> {
  const serverClient = getSupabaseAdminClient();
  if (!serverClient) {
    throw new Error("Supabase admin client not found");
  }
  const { data: screenplayData, error: screenplayError } = await serverClient
    .from("screenplays")
    .select("id, title, raw_text, created_at")
    .eq("id", screenplayId)
    .single();
  if (screenplayError) {
    await logDbError("getScreenplayData", screenplayError.message, {
      screenplay_id: screenplayId,
      code: screenplayError.code,
    });
    throw new Error("Failed to get screenplay data");
  }
  return {
    id: screenplayData.id,
    title: screenplayData.title,
    raw_text: screenplayData.raw_text,
    created_at: screenplayData.created_at,
  };
}

export async function getScreenplayStats(
  limit: number,
): Promise<ScreenplayStatsRow[]> {
  const serverClient = getSupabaseAdminClient();
  if (!serverClient) {
    throw new Error("Supabase admin client not found");
  }
  const { data, error } = await serverClient
    .from("screenplays")
    .select(
      "id, title, scene_count, last_scene_parsed, number_of_characters, stage_of_development, created_at, owner_id",
    )
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) {
    await logDbError("getScreenplayStats", error.message, {
      code: error.code,
    });
    throw new Error("Failed to get screenplay stats");
  }
  return attachRecentErrors((data ?? []) as ScreenplayStatsDbRow[]);
}

export async function getScreenplayStatsForOwner(
  ownerId: string,
  limit: number,
): Promise<ScreenplayStatsRow[]> {
  const serverClient = getSupabaseAdminClient();
  if (!serverClient) {
    throw new Error("Supabase admin client not found");
  }
  const { data, error } = await serverClient
    .from("screenplays")
    .select(
      "id, title, scene_count, last_scene_parsed, number_of_characters, stage_of_development, created_at, owner_id",
    )
    .eq("owner_id", ownerId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) {
    await logDbError("getScreenplayStatsForOwner", error.message, {
      code: error.code,
      owner_id: ownerId,
    });
    throw new Error("Failed to get screenplay stats for owner");
  }
  return attachRecentErrors((data ?? []) as ScreenplayStatsDbRow[]);
}
