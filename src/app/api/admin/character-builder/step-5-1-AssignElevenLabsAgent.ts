import { getSupabaseAdminClient } from "@/lib/supabaseServer";
import { CharacterVoiceId } from "@/lib/types";

/**
 * Creates or retrieves an ElevenLabs agent for a character.
 * 
 * @param characterName - Name of the character
 * @param voicePrompt - Description/prompt for the voice agent
 * @returns The agent_id from ElevenLabs
 * 
 * TODO: Add Supabase caching to avoid creating duplicate agents
 */
export async function voiceIdExists(
  characterName: string,

): Promise<string> {
  // TODO: 1. Check if agent already exists in Supabase
  /*
  Table, character_voices - character, voice_id, screenplay_id, description, labels, reason.

  const { data: existing } = await getSupabaseAdminClient()
    .from("character_voices")
    .select("*")
    .eq("character_name", characterName);

  return existing?.[0]?.voice_id ?? "";
const characterVoiceId: CharacterVoiceId = {
  character_name: characterName,
  voice_id: "",
  description: "",
  labels: "",
  reason: "",
}
*/
console.log("voiceIdExists: " + characterName);
return "";
}
