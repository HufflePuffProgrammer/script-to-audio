import { NextResponse } from "next/server";
import { parseScriptToCharInput } from "@/lib/parseScriptToCharInput";
import {buildLLMCharacterInput} from "./step-1-buildLLMCharacterInput";
import {buildCharacterProfilingPrompt} from "./step-2-buildCharacterProfilingPrompt";
import {generateCharacterProfile} from "./step-3-generateCharacterProfile";

import {buildVoiceRankingPrompt} from "./step-5-2-VoiceRankingPrompt";
import {rankVoicesWithClaude} from "./step-5-3-RankVoicesWithClaude";
import { getAvailableVoices } from "@/lib/audio/getAvailableVoices";
import { CharacterVoiceIds } from "@/lib/types";
import { getSupabaseAdminClient } from "@/lib/supabaseServer";
import { buildCharacterProfile } from "@/lib/buildCharacterProfile";

  export async function POST(request: Request) {
    try {
      const { text,screenplayId } = await request.json();
      if (!text || typeof text !== "string" || !text.trim()) {
        return NextResponse.json({ error: "No screenplay text provided." }, { status: 400 });
      }
      const availableVoices = await getAvailableVoices();
      const supabase = getSupabaseAdminClient();
      if (!supabase) {
        return NextResponse.json({ error: "Supabase is not configured" }, { status: 500 });
      } 
      const { data: screenplayRow, error: screenplayError } = await supabase
        .from("screenplays")
        .select("id,title,raw_text,created_at")
        .eq("id", screenplayId)
        .single();

      if (screenplayError) {
        return NextResponse.json({ error: "Screenplay not found" }, { status: 404 });
      }
      else {
        console.log("ID:",screenplayRow?.id, "screenplayId:",screenplayId);
        console.log("screenplayRow.title:",screenplayRow?.title, );
        console.log("screenplayRow.raw_text:",screenplayRow?.raw_text);
        console.log("screenplayRow.created_at:",screenplayRow?.created_at);
      }
      //1. parse screenplay to character profile
      const characterInputs = parseScriptToCharInput(text);

      //2. Build ElevenLabs Character Profile prompt
      // const profiles = [];
      // const characterVoiceIds: CharacterVoiceIds[] = [];
      // const profilePrompts = [];
      console.log("screenplayId: route",screenplayId);
      const {profiles, characterVoiceIds, profilePrompts} = await buildCharacterProfile(characterInputs, availableVoices, screenplayId);
      if (!profiles || !characterVoiceIds || !profilePrompts) {
        return NextResponse.json({ error: "Failed to build character profile" }, { status: 500 });
      }
      console.log("profiles:",profiles);
      console.log("characterVoiceIds:",characterVoiceIds);
      console.log("profilePrompts:",profilePrompts);
      /*
      for (const characterInput of characterInputs) {
        const profilePrompt = buildCharacterProfilingPrompt(characterInput);
        profilePrompts.push(profilePrompt);
        const profile = await generateCharacterProfile(profilePrompt); 
        profiles.push(profile);
        
        // step-5-1-AssignElevenLabsAgent -Upsert into DB
        await voiceIdExists(screenplayId, characterInput.character);
        // step-5-2 VoiceRankingPrompt
        const voiceRankingPrompt = await buildVoiceRankingPrompt(profile, availableVoices);
 
        //5-3 Rank Voices with Claude
        const bestRankedVoice = await rankVoicesWithClaude(profile, availableVoices, voiceRankingPrompt);
 
        characterVoiceIds.push({
          character_name: characterInput.character,
          voice_id: bestRankedVoice.best_voice_id,
          description: bestRankedVoice.description,
          labels: bestRankedVoice.labels,
          reason: bestRankedVoice.reason,
        });
        //6- Assign Voice to Character. Upsert to database
        // TBD: Add Supabase caching to avoid assigning duplicate voices
        
        await upsertVoiceToCharacter(
          screenplayId,
          characterInput.character,
          bestRankedVoice.best_voice_id,
          bestRankedVoice.description,
          bestRankedVoice.labels,
          bestRankedVoice.reason,
        );
    
      }
      */
      return NextResponse.json({profiles,characterVoiceIds, profilePrompts });
    } catch (error) {
      console.error("Character builder route error", error);
      return NextResponse.json({ error: "Failed to parse screenplay." }, { status: 500 });
    }
}