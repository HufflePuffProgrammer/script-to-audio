interface LLMCharacterInput {
  character: string;
  genre: string;
  profilingSceneLimit: number;
  sceneContext: string[];
  sampleDialogue: string[];
}

export function buildLLMCharacterInput(
  parsedScreenplay: unknown,

): LLMCharacterInput {

  const llmInput: LLMCharacterInput = {
    character: "Kyler",
    genre: "Comedy",
    profilingSceneLimit: 1,
    sceneContext: [
      "Scene Heading: INT. BASEMENT - NIGHT",
      "Dark, empty basement. The air is silent except for faint breathing.",
    ],
    sampleDialogue: ["I can see you", "Boo!"],
  };

  return llmInput;
}

