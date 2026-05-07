import { getSupabaseAdminClient } from "@/lib/supabaseServer";

/**
 * True when character_voices already has a non-empty voice_id for this screenplay + character.
 */
export async function voiceIdExists(
  screenplayId: string,
  characterName: string,
): Promise<boolean> {
  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    throw new Error("Supabase is not configured");
  }
  const { data: existing } = await supabase
    .from("character_voices")
    .select("voice_id")
    .eq("screenplay_id", screenplayId)
    .eq("character", characterName)
    .maybeSingle();

  console.log("voiceIdExists lookup:", { screenplayId, characterName, existing });

  if (
    existing?.voice_id != null &&
    existing.voice_id !== ""
  ) {
    console.log("voiceIdExists: existing:", characterName, existing.voice_id);
    return true;
  }
  console.log("not existing:", characterName);
  return false;
}
