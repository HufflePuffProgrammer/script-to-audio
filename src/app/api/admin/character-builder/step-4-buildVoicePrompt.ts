import type { CharacterProfile } from "@/lib/types";

export function buildVoicePrompt(
  characterName: string,
  profile: CharacterProfile,
  sampleDialogue: string[] = []
): string {

  return `
  Character Name: ${characterName}
  
  Age Range: ${profile.age}
  Gender: ${profile.gender}
  
  Personality:
  ${(profile.traits ?? "").split(",").map((trait: string) => `- ${trait.trim()}`).join("\n")}
  Vocal Style:
  ${(profile.voiceStyle ?? "").split(",").map((style: string) => `- ${style.trim()}`).join("\n")}
  
  Speech Pattern:
  ${(profile.speechPattern ?? "").split(",").map((pattern: string) => `- ${pattern.trim()}`).join("\n")}
  
  Tone:
  ${(profile.tone ?? "").split(",").map((tone: string) => `- ${tone.trim()}`).join("\n")}
  
  Performance Guidance:
  Deliver lines in a way that reflects the personality and tone above.
  Maintain consistency across scenes.
  Do not exaggerate emotion unless specified by dialogue.
  
  Sample Dialogue:
  ${sampleDialogue.map((line) => `"${line}"`).join("\n")}
  `;
}


  