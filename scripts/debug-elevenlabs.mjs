
// Debug helper to verify ElevenLabs API connectivity.
// Run with: npm run debug:elevenlabs
import "dotenv/config";
import { ElevenLabsClient, play } from "@elevenlabs/elevenlabs-js";

const main = async () => {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    console.error("Missing ELEVENLABS_API_KEY in environment.");
    process.exit(1);
  }

  console.log("Initializing ElevenLabs client...");
  const elevenlabs = new ElevenLabsClient({ apiKey });
  console.log("Client initialized. Sending textToDialogue request...");

  const audio = await elevenlabs.textToDialogue.convert({
    inputs: [
      {
        text: "[cheerfully] Hello, Harry. You're a wizard now. How do you feel?",
        voiceId: "9BWtsMINqrJLrRacOk9x",
      },
      {
        text: "[stuttering] I'm... I'm doing well, where am I? Is voldemorearound? What about Hermoine?",
        voiceId: "IKne3meq5aSn9XLyUdCD",
      },
    ],
  });

  console.log(`Received audio buffer length: ${audio?.length ?? 0}`);
  await play(audio);
  console.log("Played sample dialogue. If you heard nothing, check system volume/output device.");
};

main().catch((err) => {
  console.error("Error during ElevenLabs debug run:", err);
  process.exit(1);
});

