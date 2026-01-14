import Anthropic from "@anthropic-ai/sdk";
import { CharacterProfile, AvailableVoices } from "../utils";

const MODEL = process.env.CLAUDE_MODEL
  || "claude-3-5-haiku-20241022";


const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

export async function rankVoicesWithClaude(characterProfile: CharacterProfile, voices: AvailableVoices[], prompt: string) {

  console.log("before claude");
  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 300,
    temperature: 0.1,
    messages: [
      {
        role: "user",
        content: prompt
      }
    ]
  });
  // const res = await anthropic.messages.create({
  //   model: "claude-3-5-haiku-20241022",
  //   max_tokens: 10,
  //   messages: [{ role: "user", content: "Say hi" }]
  // });

  // console.log(res.content[0].text);
  console.log("after claude");
  
  const text = response.content[0].type === "text" 
    ? response.content[0].text.trim()
    : "";

  if (!text) {
    throw new Error("Claude response did not contain text content");
  }

  console.log("response");
  try {
   // Remove markdown code blocks if present
    const cleanedText = text.replace(/^```json\n?/g, "").replace(/\n?```$/g, "").trim();
    console.log("cleanedText");
    console.log(cleanedText);
    return JSON.parse(cleanedText);
  } catch (err) {
    console.error("Claude voice ranking returned invalid JSON:", text);
    throw new Error("Invalid JSON from Claude");
  }
}

