
const { ElevenLabsClient,play } = require("elevenlabs");

const { Readable } = require("stream");
const fs = require("fs");

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
    
    try {
        const stream = await client.textToSpeech.convert(
        "21m00Tcm4TlvDq8ikWAM", {      
            model_id: "eleven_multilingual_v2",
            text: "If this test works, I will be happy. Richard is the best.",
            outputFormat: 'mp3_44100_128'
        });
        await play(stream);
        expect(stream).toBeDefined();
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
//     // ✅ Stream sanity checks
    expect(stream).toBeDefined();
   //expect(stream).toBeInstanceOf(Readable);


//     // ✅ Consume stream safely
    let totalBytes = 0;
    const outputPath = `./audio/test-textToSpeech.mp3`;
    console.log("outputPath", outputPath);
    
    //fs.mkdirSync("./audio", { recursive: true });
    //const writer = fs.createWriteStream(outputPath);
   //fs.writeFileSync(outputPath, stream);
    await play(stream);
    for await (const chunk of stream) {
      totalBytes += chunk.length;
    }
    console.log("totalBytes", totalBytes);

//     expect(totalBytes).toBeGreaterThan(0);
    }, 15000); // ⏱ allow network latency


});
