import {CharacterInput, CharacterVoiceIds} from "@/lib/types";
import {voiceIdExists} from "@/app/api/admin/character-builder/VoiceIdExists";
import {buildCharacterProfilePrompt} from "@/app/api/admin/character-builder/buildCharacterProfilePrompt";
import {generateCharacterProfile} from "@/app/api/admin/character-builder/generateCharacterProfile";
import {buildVoiceRankingPrompt} from "@/app/api/admin/character-builder/buildVoiceRankingPrompt";
import {generateBestRankedVoiceWithClaude} from "@/app/api/admin/character-builder/generateBestRankedVoiceWithClaude";
import {upsertVoiceIdToCharacter} from "@/app/api/admin/character-builder/upsertVoiceIdToCharacter";
import { AvailableVoices } from "@/lib/types";

export async function buildCharacterProfile(characterInputs: CharacterInput[], availableVoices: AvailableVoices, screenplayId: string ){

    if (!characterInputs) {
        return null;
    }
    const profiles = [];
    const characterVoiceIds: CharacterVoiceIds[] =[];
    const profilePrompts = [];
  
    for (const characterInput of characterInputs) {
        if (await voiceIdExists(screenplayId, characterInput.character)) {
          /* DEBUGGING
          console.log("voiceIdExists, skipping: ", characterInput.character);
          */
          continue;
        }
        
        const profilePrompt = buildCharacterProfilePrompt(characterInput);
        profilePrompts.push(profilePrompt);
        
        const profile = await generateCharacterProfile(profilePrompt);
        profiles.push(profile);

        const voiceRankingPrompt = await buildVoiceRankingPrompt(profile, availableVoices);

        const bestRankedVoice = await generateBestRankedVoiceWithClaude(
          profile,
          availableVoices,
          voiceRankingPrompt,
        );

        characterVoiceIds.push({
          character_name: characterInput.character,
          voice_id: bestRankedVoice.best_voice_id,
          description: bestRankedVoice.description,
          labels: bestRankedVoice.labels,
          reason: bestRankedVoice.reason,
          });

        //6- Assign Voice to Character. Upsert to database
        await upsertVoiceIdToCharacter(
          screenplayId,
          characterInput.character,
          bestRankedVoice.best_voice_id,
          bestRankedVoice.description,
          bestRankedVoice.labels,
          bestRankedVoice.reason,
        );
      }

    return ({profiles, characterVoiceIds, profilePrompts});


}