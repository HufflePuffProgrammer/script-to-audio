import { getSupabaseAdminClient } from "@/lib/supabaseServer";


/**
 * Creates or retrieves an ElevenLabs agent for a character.
 * 
 * @param characterName - Name of the character
 * @param voicePrompt - Description/prompt for the voice agent
 * @returns The agent_id from ElevenLabs
 * 
 * TODO: Add Supabase caching to avoid creating duplicate agents
 */
export async function AssignElevenLabsAgent(
  characterName: string,

): Promise<string> {
  // TODO: 1. Check if agent already exists in Supabase
  // const { data: existing } = await getSupabaseAdminClient()
  //   .from("character_voices")
  //   .select("*")
  //   .eq("character_name", characterName);

  // return existing?.[0]?.voice_id ?? "";
  return "";
}
