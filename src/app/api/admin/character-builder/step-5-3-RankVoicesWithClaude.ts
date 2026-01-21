import Anthropic from "@anthropic-ai/sdk";
import { CharacterProfile, AvailableVoices } from "../utils";

const MODEL = process.env.CLAUDE_MODEL
  || "claude-3-5-haiku-20241022";


const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY_CHARACTER_PROFILE
});

export async function rankVoicesWithClaude(characterProfile: CharacterProfile, voices: AvailableVoices[], prompt: string) {


  const response = await anthropic.messages.create({
    model: MODEL,
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
    throw new Error("Claude response did not contain text content");
  }


  try {
   // Remove markdown code blocks if present
    const cleanedText = text.replace(/^```json\n?/g, "").replace(/\n?```$/g, "").trim();

    return JSON.parse(cleanedText);
  } catch (err) {
    console.error("Claude voice ranking returned invalid JSON:", text);
    throw new Error("Invalid JSON from Claude");
  }
}

