const { ElevenLabsClient,play } = require("elevenlabs");
const fs = require("fs");
const elevenlabs = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY
});

console.log("elevenlabs initialized");
async function generateSceneAudio(scene, mockClient) {
    const audioChunks = [];
    let audioStream;
    console.log("scene");
    console.log(scene);
    for (const line of scene.dialogue) {
       audioStream = await mockClient.textToSpeech.convert(
        line.voice_id,
        {
          text: line.text,
          model_id: "eleven_multilingual_v2"
        }
      );

      //const buffer = Buffer.from(await audioStream.arrayBuffer());
      //audioChunks.push(buffer);

    }
    await play(audioStream);
  
    // const finalAudio = Buffer.concat(audioChunks);
     const outputPath = `./audio/${scene.id}.mp3`;
 
    console.log("outputPath");
    console.log(outputPath);
     fs.mkdirSync("./audio", { recursive: true });
     fs.writeFileSync(outputPath, audioStream);
  
    return outputPath;
}
const scene = {
  id: "scene_real_audio",
  heading: "INT. CABIN - NIGHT",
  dialogue: [
    {
      character: "NARRATOR",
      text: "The wind howls outside the cabin.",
      voice_id: "JBFqnCBsd6RMkjVDRZzb"
    },
    {
      character: "JOHN",
      text: "Did you hear that?",
      voice_id: "SAz9YHcvj6GT2YYXdXww"
    }
  ]
};

(async () => {
  const output = await generateSceneAudio(scene, elevenlabs);
  console.log("Audio written to:", output);
})();
