import { CharacterProfile } from "./step-3-generateCharacterProfile";

export function buildElevenLabsVoicePrompt(
  characterName: string,
  profile: CharacterProfile,
  sampleDialogue: string[] = []
): string {
  console.log("Step-4-buildElevenLabsVoicePrompt", characterName);
  //console.log("profile",profile);
  //console.log("sampleDialogue",sampleDialogue);
  return `
  Character Name: ${characterName}
  
  Age: ${profile.age}
  Gender: ${profile.gender}
  
  Personality Traits:
  ${profile.traits}
  
  Vocal Style:
  ${profile.voiceStyle}
  
  Speech Pattern:
  ${profile.speechPattern}
  
  Tone:
  ${profile.tone}
  
  Performance Guidance:
  Deliver lines in a way that reflects the personality and tone above.
  Maintain consistency across scenes.
  Do not exaggerate emotion unless specified by dialogue.
  
  Sample Dialogue:
  ${sampleDialogue.map((line) => `"${line}"`).join("\n")}
  `;
}


  