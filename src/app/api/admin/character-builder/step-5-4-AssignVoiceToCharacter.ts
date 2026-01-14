const axios = require("axios");
//const { rankVoicesWithClaude } = require("./step-5-3-rankVoicesWithClaude");
const { rankVoicesWithClaude } = require("./step-5-3-RankVoicesWithClaude");
const { getAvailableVoices } = require("../utils");
const ELEVEN_API_KEY = process.env.ELEVENLABS_API_KEY;
const ELEVEN_BASE_URL = "https://api.elevenlabs.io/v1";

export interface CharacterProfile {
    age: string;
    gender: string;
    traits: string;
    voiceStyle: string;
    speechPattern: string;
    tone: string;
    confidence?: string;
  };

  export interface AvailableVoices{
    voice_id: string;
    description: string;
    labels: string;
  }[]=[{
    voice_id: "",
    description: "",
    labels: "",
  }];
/**
 * Simple heuristic fallback
 */
function heuristicVoiceFallback(voices: AvailableVoices[], profile: CharacterProfile) {
  return (
    voices.find(v => v.labels.includes(profile.gender.toLowerCase())) ||
    voices[0]
  );
}

/**
 * Assign voice to character using Claude ranking
 */
export async function assignVoiceToCharacter(characterName: string, profile: CharacterProfile, availableVoices: any, rankedVoiceId: string) {
  // 1. Reuse existing voice
  // const { data: existing } = await db
  //   .from("character_voices")
  //   .select("*")
  //   .eq("character_name", characterName)
  //   .single();

  // if (existing) {
  //   return existing.voice_id;
  // }

  // 2. Fetch voices
  const voices = await getAvailableVoices();

  // // 3. Claude-assisted ranking
  let selectedVoice;
  let selectionReason = "heuristic fallback";

  try {
    console.log("rankingVoicesWithClaude");
    console.log("availableVoices");
    //console.log(availableVoices);
    //const ranking = await rankVoicesWithClaude(profile, voices);
    //console.log("ranking");
    //console.log(ranking);
    //selectedVoice = voices.find(v => v.voice_id === ranking.best_voice_id);
    selectedVoice = voices.find((v: AvailableVoices) => v.voice_id === rankedVoiceId);
    //selectionReason = ranking.reason;
    selectionReason = "ranked voice id";
    console.log("selectedVoice");
    console.log(selectedVoice);
  } catch (err) {
    console.warn("Claude voice ranking failed:", err instanceof Error ? err.message : "Unknown error");
  }

  // 4. Fallback
//  if (!selectedVoice) {
 //   selectedVoice = heuristicVoiceFallback(voices, profile);
  //}

  // 5. Persist mapping
  // await db.from("character_voices").insert({
  //   character_name: characterName,
  //   voice_id: selectedVoice.voice_id,
  //   profile,
  //   selection_reason: selectionReason
  // });

   return selectedVoice.voice_id;
  return "";
};

