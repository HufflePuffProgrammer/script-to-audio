const axios = require("axios");
 import { db } from "@/lib/db";
 import { getSupabaseAdminClient } from "@/lib/supabaseServer";
export interface CharacterProfile {
    age: string;
    gender: string;
    traits: string;
    voiceStyle: string;
    speechPattern: string;
    tone: string;
    confidence?: string;
  };

/**
 * Assign voice to character using Claude ranking
 */
export async function assignVoiceToCharacter(characterName: string, profile: CharacterProfile, rankedVoiceId: string, selectionReason: string) {
  
  console.log("assignVoiceToCharacter");
  console.log(characterName);
  console.log(profile);
  console.log(rankedVoiceId);
  console.log(selectionReason); 
  // // 1. Reuse existing voice
  // const { data: existing } = await db
  //   .from("character_voices")
  //   .select("*")
  //   .eq("character_name", characterName)
  //   .single();

  // if (existing) {
  //   return existing.voice_id;
  // }

  // else {
  // //  2. Upsert mapping
  //   await db.from("character_voices").insert({
  //     character_name: characterName,
  //     voice_id: rankedVoiceId,
  //     profile,
  //     selection_reason: selectionReason
  //   });
  //   return rankedVoiceId;
  // }
  return rankedVoiceId;
};

