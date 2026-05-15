import { upsertVoiceIdToCharacterAction } from "@/lib/db/action";

export async function upsertVoiceIdToCharacter(
  screenplayId: string,
  characterName: string,
  rankedVoiceId: string,
  description: string,
  labels: string,
  reason: string,
): Promise<string> {

  return await upsertVoiceIdToCharacterAction(
    screenplayId,
    characterName,
    rankedVoiceId,
    description,
    labels,
    reason,
  )
 
}
