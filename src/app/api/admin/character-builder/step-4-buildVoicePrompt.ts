import { CharacterProfile } from "./step-3-generateCharacterProfile";

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
  ${profile.traits.split(",").map((trait) => `- ${trait}`).join("\n")}
  Vocal Style:
  ${profile.voiceStyle.split(",").map((style) => `- {$style}`).join("\n")}
  
  Speech Pattern:
  ${profile.speechPattern.split(",").map((pattern) => `- ${pattern}`).join("\n")}
  
  Tone:
  ${profile.tone.split(",").map((tone) => `- ${tone}`).join("\n")}
  
  Performance Guidance:
  Deliver lines in a way that reflects the personality and tone above.
  Maintain consistency across scenes.
  Do not exaggerate emotion unless specified by dialogue.
  
  Sample Dialogue:
  ${sampleDialogue.map((line) => `"${line}"`).join("\n")}
  `;
}


  