// step5-buildVoiceRankingPrompt.js

import { CharacterProfile, AvailableVoices } from "../utils";
export async function buildVoiceRankingPrompt(characterProfile : CharacterProfile, availableVoices : AvailableVoices[]) {
    return `
  You are selecting the best text-to-speech voice for a film character.
  
  Character Profile:
  ${JSON.stringify(characterProfile, null, 2)}
  
  Available Voices:
  ${availableVoices.map(v => `
  Voice ID: ${v.voice_id}
  Description: ${v.description || "No description"}
  Labels: ${JSON.stringify(v.labels || {})}
  `).join("\n")}
  
  Rules:
  - Choose the voice that best matches tone, personality, and vocal style
  - Gender mismatch is allowed ONLY if it improves performance
  - Do not invent new voices
  - Output ONLY valid JSON
  
  Return:
  {
    "best_voice_id": "",
    "reason": ""
  }
  `;
  }
  

  