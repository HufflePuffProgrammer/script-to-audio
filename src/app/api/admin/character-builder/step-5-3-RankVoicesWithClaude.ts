import Anthropic from "@anthropic-ai/sdk";
import { CharacterProfile, AvailableVoices } from "@/lib/types";

/** Model id only — set in `.env.local` as `MODEL_ANTHROPIC_VOICE_RANKING`, or falls back here. */
const MODEL_ANTHROPIC_VOICE_RANKING =
  process.env.MODEL_ANTHROPIC_VOICE_RANKING?.trim() ||
  process.env.CLAUDE_MODEL?.replace(/^"|"$/g, "").trim() ||
  "claude-3-5-haiku-20241022";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY_CHARACTER_PROFILE,
});

export async function rankVoicesWithClaude(characterProfile: CharacterProfile, voices: AvailableVoices, prompt: string) {
  try {
    const response = await anthropic.messages.create({
      model: MODEL_ANTHROPIC_VOICE_RANKING,
      max_tokens: 400,
      temperature: 0.1,
      messages: [
        {
          role: "user",
          content: prompt
        }
      ]
    });
   
    const text = response.content[0].type === "text" 
      ? response.content[0].text.trim()
      : "";
    if (!text) {
      return {message: "Claude response did not contain text content", status: 500}
    }
    try {
      const cleanedText = text.replace(/^```json\n?/g, "").replace(/\n?```$/g, "").trim();
      return JSON.parse(cleanedText);
    }
    catch (err){
      return {message: "Invalid JSON from Claude", status: "500"};
    }
    
  } catch (err) {
    console.error("Claude voice ranking error:", err);
    return {message: "Claude voice ranking error", status: 500};
  }

}

