//const { ElevenLabsClient } = require("elevenlabs");
//const { Readable } = require("stream");
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import { Readable } from "stream";

describe("ElevenLabs textToSpeech.convert", () => {
  let client;

  beforeAll(() => {
    if (!process.env.ELEVENLABS_API_KEY) {
      throw new Error("ELEVENLABS_API_KEY is not set");
    }

    client = new ElevenLabsClient({
      apiKey: process.env.ELEVENLABS_API_KEY
    });
  });

  it("returns a readable audio stream with data", async () => {
    const stream = await client.textToSpeech.convert(
       "21m00Tcm4TlvDq8ikWAM", {      
        model_id: "eleven_multilingual_v2",
        text: "This is a test of ElevenLabs text to speech."
    });

    // ✅ Stream sanity checks
    expect(stream).toBeDefined();
   // expect(stream).toBeInstanceOf(Readable);


    // ✅ Consume stream safely
    let totalBytes = 0;

    for await (const chunk of stream) {
      totalBytes += chunk.length;
    }

    expect(totalBytes).toBeGreaterThan(0);
  }, 15000); // ⏱ allow network latency
});
