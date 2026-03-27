import { NextResponse } from "next/server";
import { parseScriptToCharInput } from "@/lib/parseScriptToCharInput";
import {buildLLMCharacterInput} from "./step-1-buildLLMCharacterInput";
import {buildCharacterProfilingPrompt} from "./step-2-buildCharacterProfilingPrompt";
import {generateCharacterProfile} from "./step-3-generateCharacterProfile";
import {buildVoicePrompt} from "./step-4-buildVoicePrompt";
import {buildVoiceRankingPrompt} from "./step-5-2-VoiceRankingPrompt";
import {rankVoicesWithClaude} from "./step-5-3-RankVoicesWithClaude";
import {assignVoiceToCharacter} from "./step-5-4-AssignVoiceToCharacter";
import {AssignElevenLabsAgent} from "./step-5-1-AssignElevenLabsAgent";
import { AvailableVoices, getAvailableVoices } from "../utils";
import { profile } from "node:console";

import { CharacterVoiceIds } from "@/lib/types";

  export async function POST(request: Request) {
    try {
      const { text } = await request.json();
      if (!text || typeof text !== "string" || !text.trim()) {
        return NextResponse.json({ error: "No screenplay text provided." }, { status: 400 });
      }
      //5. Check if audio exists in Supabase
      //const audioUrl = await AssignElevenLabsAgent(characterName,voicePrompt);

      //5-1 Get Available Voices
      const availableVoices = await getAvailableVoices();
      
      //1. parse screenplay to character profile
      const parsedScreenplay = parseScriptToCharInput(text);

      //2. Build ElevenLabs Character Profile prompt
      const profiles = [];
      const characterVoiceIds: CharacterVoiceIds[] = [];
      const profilePrompts = [];
      for (const characterInput of parsedScreenplay) {
        const profilePrompt = buildCharacterProfilingPrompt(characterInput);
        profilePrompts.push(profilePrompt);
        const profile = await generateCharacterProfile(profilePrompt);

        const voicePrompt = buildVoicePrompt(
          characterInput.character,
          profile,
          characterInput.dialogue
        );
    
        profiles.push(profile);
        // step-5-1-AssignElevenLabsAgent -Upsert into DB
        
        // step-5-2 VoiceRankingPrompt
        const voiceRankingPrompt = await buildVoiceRankingPrompt(profile, availableVoices);
 
        //5-3 Rank Voices with Claude
        const bestRankedVoice = await rankVoicesWithClaude(profile, availableVoices, voiceRankingPrompt);
 
        characterVoiceIds.push({
          character_name: characterInput.character, 
          voice_id: bestRankedVoice.best_voice_id, 
          description: bestRankedVoice.description, 
          labels: bestRankedVoice.labels, 
          reason: bestRankedVoice.reason}

        );
        //6- Assign Voice to Character. Upsert to database
        //const voiceId = await assignVoiceToCharacter(characterName, profile, bestRankedVoice.best_voice_id, bestRankedVoice.reason);
     
      }
      return NextResponse.json({profiles,characterVoiceIds, profilePrompts });
    } catch (error) {
      console.error("Character builder route error", error);
      return NextResponse.json({ error: "Failed to parse screenplay." }, { status: 500 });
    }
}