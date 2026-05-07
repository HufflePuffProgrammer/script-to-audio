import { getSupabaseAdminClient } from "@/lib/supabaseServer";

/**
 * Persist Claude-ranked voice choice for a character (Supabase upsert).
 */
export async function upsertVoiceIdToCharacter(
  screenplayId: string,
  characterName: string,
  rankedVoiceId: string,
  description: string,
  labels: string,
  reason: string,
): Promise<string> {
  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    throw new Error("Supabase is not configured");
  }

  const { data, error } = await supabase
    .from("character_voices")
    .upsert({
      screenplay_id: screenplayId,
      character: characterName,
      voice_id: rankedVoiceId,
      description,
      labels,
      reason,
    }, { onConflict: "screenplay_id,character" })
    .select("id")
    .single();

  if (error) {
    console.error("insertVoiceToCharacter:error:", error);
    throw error;
  }

  return data?.id != null ? String(data.id) : rankedVoiceId;
}
