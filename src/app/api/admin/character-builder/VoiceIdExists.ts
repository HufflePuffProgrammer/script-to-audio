// import { getSupabaseAdminClient } from "@/lib/supabaseServer";

import { verifyVoiceIdExists} from "@/lib/db/data";
/**
 * True when character_voices already has a non-empty voice_id for this screenplay + character.
 */
export async function voiceIdExists(
  screenplayId: string,
  characterName: string,
): Promise<boolean> {
  

  return await verifyVoiceIdExists(screenplayId, characterName);
  
}
