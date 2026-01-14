const { ElevenLabsClient } = require("elevenlabs");
const fs = require("fs");

describe("ElevenLabs Voice ID Verification", () => {
  let client;

  beforeAll(() => {
    client = new ElevenLabsClient({
      apiKey: process.env.ELEVENLABS_API_KEY
    });
  });

  it("all configured voice IDs exist in ElevenLabs", async () => {
    // 🔧 Voice IDs used by your app
    const REQUIRED_VOICE_IDS = [
        "pFZP5JQG7iQjIQuC4Bku",
        "pNInz6obpgDQGcFmaJgB",
        "pqHfZKP75CvOlQylNhV4",
        "JBFqnCBsd6RMkjVDRZzb",
        "SAz9YHcvj6GT2YYXdXww",
      ];
      // JBFqnCBsd6RMkjVDRZzb 
      // NARRATOR BRITSH
      //   description: Warm resonance that instantly captivates listeners.
      // SAz9YHcvj6GT2YYXdXww
      // name: NARRATOR
      // description: A relaxed, neutral voice ready for narrations or conversational projects.
      // labels: Americans

    // MISSING
    // const REQUIRED_VOICE_IDS = [
    //   "21m00Tcm4TlvDq8ikWAM",
    //   "AZnzlk1XvdvUeBnXmlld",
    //   "EXAVITQu4vr4xnSDxMaL"
    // ];

    // 🔊 Fetch voices from ElevenLabs
    const voicesResponse = await client.voices.getAll();

    expect(voicesResponse).toBeDefined();
    expect(Array.isArray(voicesResponse.voices)).toBe(true);

    const availableVoiceIds = new Set(
      voicesResponse.voices.map(v => v.voice_id)
    );
    // voicesResponse.voices.map(v => {
    //     console.log("availableVoiceIds:", v.voice_id);
    //     console.log("name:", v.name);
    //     console.log("description:", v.description);
    //     console.log("labels:", v.labels);
    // });
    // ✅ Validate each required voice
    const missingVoices = REQUIRED_VOICE_IDS.filter(
      id => !availableVoiceIds.has(id)
    );

    if (missingVoices.length > 0) {
      throw new Error(
        `Missing ElevenLabs voice IDs:\n${missingVoices.join("\n")}`
      );
    }
  });
});
