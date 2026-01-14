const { ElevenLabsClient,play } = require("elevenlabs");
const fs = require("fs");


async function webStreamToBuffer(webStream) {
    const reader = webStream.getReader();
    const chunks = [];
    console.log("webStream");
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(Buffer.from(value));
    }
  
    return Buffer.concat(chunks);
  }

  async function elevenLabsToBuffer(result) {
    if (result?.getReader) {
      return webStreamToBuffer(result);
    }
  
    if (result?.[Symbol.asyncIterator]) {
      const chunks = [];
      console.log("asyncIterator");
      for await (const chunk of result) {
        chunks.push(Buffer.from(chunk));
      }
      return Buffer.concat(chunks);
    }
  
    throw new Error("Unknown ElevenLabs audio format");
  }
  
describe("ElevenLabs textToDialogue.convert", () => {
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

        const audioStream = await client.textToSpeech.convert(
            "21m00Tcm4TlvDq8ikWAM", {      
                model_id: "eleven_multilingual_v2",
                text: "If this audio test works, I will be happy. Richard is the best Audio Stream Engineer.",
                outputFormat: 'mp3_44100_128'
            });
       
        const buffer = await elevenLabsToBuffer(audioStream);
        fs.writeFileSync("audio/output.mp3", buffer);


        // ✅ Stream sanity checks
       expect(stream).toBeDefined();
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
    }, 15000); // ⏱ allow network latency
});
