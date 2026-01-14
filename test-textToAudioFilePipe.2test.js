const { ElevenLabsClient } = require("elevenlabs");
const fs = require("fs");
const { pipeline } = require("stream/promises");
const { Readable } = require("stream");

function webToNodeStream(webStream) {
    return Readable.fromWeb(webStream);
  }

async function saveAudioToFile(elevenlabsClient, textInput, voiceId, outputPathInput) {

    const webStream = await elevenlabsClient.textToSpeech.convert(
    voiceId, {      
        model_id: "eleven_multilingual_v2",
        text: textInput,
        outputFormat: 'mp3_44100_128'
    });  

    const nodeStream = webToNodeStream(webStream);
    const writeStream = fs.createWriteStream(outputPathInput);

    await pipeline(nodeStream, writeStream);

    return outputPathInput;
}


describe("ElevenLabs textToSpeech Webstream to File Pipe.convert", () => {
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
    const text = "If this audio stream stream stream to file pipe test works, I will be happy. Richard is the best Stream Engineer.";
    const voiceId = "21m00Tcm4TlvDq8ikWAM";
    const outputPath = "audio/streamToFilePipeoutput.mp3";
    try {
        const outputPathResult = await saveAudioToFile(client, text, voiceId, outputPath);
        console.log("outputPathResult", outputPathResult);
       
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
    }, 15000); // ⏱ allow network latency
});
