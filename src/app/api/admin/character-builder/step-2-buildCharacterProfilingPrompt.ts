

interface LLMCharacterInput {
  character: string;
  genre: string;
  profilingSceneLimit: number;
  sceneContext: string[];
  sampleDialogue: string[];
};

export function buildCharacterProfilingPrompt(llmInput: LLMCharacterInput)
{
    console.log("2-Building character profiling prompt");
    return `
  You are analyzing a film character using ONLY the information provided.
  This text is extracted from the FIRST SCENE (or first N scenes) in which the character appears.
  
  Do NOT guess information not supported by the dialogue or scene context.
  If information is unclear, mark uncertainty in the "confidence" score.
  ---
  GENRE: ${llmInput.genre}
  CHARACTER NAME: ${llmInput.character}
  SCENE CONTEXT (may include scene headings, geography, description):
  ${llmInput.sceneContext.join("\n")}
  DIALOGUE SAMPLES:
  ${llmInput.sampleDialogue.map(line => `- "${line}"`).join("\n")}
  ---
  Analyze this character and output ONLY this JSON structure:
  {
    "age": "",
    "gender": "",
    "traits": "",
    "voiceStyle": "",
    "speechPattern": "",
    "tone": "",
    "confidence": ""
  }
  
  Where:
  - "age": estimated age range based only on speech style
  - "gender": voice-presenting gender (not biological)
  - "traits": personality traits
  - "voiceStyle": how they sound (soft, tense, assertive, warm, gritty, etc.)
  - "speechPattern": word cadence, pacing, quirks
  - "tone": emotional tone or energy level
  - "confidence": 0 to 1 measuring certainty of your inference
  `;
  }
  
