import { getSupabaseAdminClient } from "@/lib/supabaseServer";
import { logDbError } from "@/lib/db/logError";

/** Row shape returned from `screenplays` table selects. */
export type ScreenplayDbRow = {
  id: string;
  title: string | null;
  raw_text: string | null;
  created_at: string;
};

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
