import Anthropic from "@anthropic-ai/sdk";

export interface CharacterProfile {
  age: string;
  gender: string;
  traits: string;
  voiceStyle: string;
  speechPattern: string;
  tone: string;
  confidence?: string;
}
  import { LLMCharacterInput } from "./route";
/**
 * Generates a character profile using Anthropic's Claude model.
 * 
 * Model options:
 * - "claude-3-5-sonnet-20241022" (Opus equivalent - best quality, more expensive)
 * - "claude-3-5-haiku-20241022" (cheap, fast, good for structured JSON)
 * 
 * For character profiling, Haiku is recommended as it's cost-effective and
 * handles structured JSON output well.
 */
export async function generateCharacterProfile(
  llmInput: LLMCharacterInput,
  profilePrompt: string
): Promise<CharacterProfile> {
  console.log("3-Generating character profile");
  
  const apiKey = process.env.ANTHROPIC_API_KEY_CHARACTER_PROFILE;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY environment variable is required");
  }

  const client = new Anthropic({ apiKey });

  // Use Haiku by default (cheap), or Opus for higher quality
  // Set ANTHROPIC_MODEL env var to override (e.g., "claude-3-5-sonnet-20241022")
  const model = process.env.ANTHROPIC_MODEL || "claude-3-5-haiku-20241022";

  try {
    const response = await client.messages.create({
      model,
      max_tokens: 400,
      temperature: 0.2, // stable inference
      system: "You specialize in film character analysis. Always return valid JSON only, no markdown formatting.",
      messages: [
        {
          role: "user",
          content: profilePrompt,
        },
      ],
    });

    const jsonText = response.content[0].type === "text" 
      ? response.content[0].text.trim()
      : "";

    // Remove markdown code blocks if present
    const cleanedText = jsonText.replace(/^```json\n?/g, "").replace(/\n?```$/g, "").trim();

    try {
      const parsed = JSON.parse(cleanedText) as CharacterProfile;
      // Validate required fields
      if (!parsed.age || !parsed.gender || !parsed.traits || !parsed.voiceStyle || !parsed.speechPattern || !parsed.tone) {
        throw new Error("LLM output missing required character profile fields");
      }
      return parsed;
    } catch (err) {
      console.error("Failed to parse LLM JSON:", err);
      console.error("Raw response:", cleanedText);
      throw new Error("LLM output was not valid JSON.");
    }
  } catch (err) {
    console.error("Anthropic API error:", err);
    throw err instanceof Error ? err : new Error("Failed to generate character profile");
  }
}