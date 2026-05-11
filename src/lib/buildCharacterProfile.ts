import {CharacterInput, CharacterVoiceIds} from "@/lib/types";
import {voiceIdExists} from "@/app/api/admin/character-builder/step-5-1-AssignElevenLabsAgent";
import {buildCharacterProfilingPrompt} from "@/app/api/admin/character-builder/step-2-buildCharacterProfilingPrompt";
import {generateCharacterProfile} from "@/app/api/admin/character-builder/step-3-generateCharacterProfile";
import {buildVoiceRankingPrompt} from "@/app/api/admin/character-builder/step-5-2-VoiceRankingPrompt";
import {rankVoicesWithClaude} from "@/app/api/admin/character-builder/step-5-3-RankVoicesWithClaude";
import {upsertVoiceIdToCharacter} from "@/app/api/admin/character-builder/step-5-4-UpsertVoiceIdToCharacter";
import { AvailableVoices } from "@/lib/types";

export async function buildCharacterProfile(characterInputs: CharacterInput[], availableVoices: AvailableVoices, screenplayId: string ){

    if (!characterInputs) {
        return null;
    }
    const profiles = [];
    const characterVoiceIds: CharacterVoiceIds[] =[];
    const profilePrompts = [];
  console.log("characterInputs: ", characterInputs);

    for (const characterInput of characterInputs) {
        if (await voiceIdExists(screenplayId, characterInput.character)) {
          console.log("voiceIdExists, skipping: ", characterInput.character);
          continue;
        }
        
        const profilePrompt = buildCharacterProfilingPrompt(characterInput);
        profilePrompts.push(profilePrompt);
        const profile = await generateCharacterProfile(profilePrompt);
        profiles.push(profile);

        // step-5-2 VoiceRankingPrompt
        const voiceRankingPrompt = await buildVoiceRankingPrompt(profile, availableVoices);

        //5-3 Rank Voices with Claude
        const bestRankedVoice = await rankVoicesWithClaude(
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