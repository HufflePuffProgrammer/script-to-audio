import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";

let client: ElevenLabsClient | null = null;

export function getElevenLabsClient() {
  if (!client) {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      throw new Error("Missing ELEVENLABS_API_KEY");
    }
    client = new ElevenLabsClient({ apiKey });
  }
  return client;
}

