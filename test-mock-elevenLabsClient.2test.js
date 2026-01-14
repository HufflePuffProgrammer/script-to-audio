const fs = require("fs");
const { Readable } = require("stream");

var  SceneType = {
    id: "",
    heading: "",
    dialogue: [{
        character: "",
        text: "",
        voice_id: ""
    }],
};

function createMockElevenLabsClient() {
  console.log("createMockElevenLabsClient");
      return {
        textToSpeech: {
           convert: jest.fn(async () => ({
             arrayBuffer: async () =>
               Uint8Array.from([1, 2, 3, 4, 5]).buffer
           }))
        }
      };
  }
  


async function generateSceneAudio(scene, elevenlabsClient) {
    const audioChunks = [];

   for (const line of scene.dialogue) {

      const audioStream =  await elevenlabsClient.textToSpeech.convert(
        line.voice_id,
        {
          text: line.text,
          model_id: "eleven_multilingual_v2"
        }
        
      );
    
      const buffer = Buffer.from(await audioStream.arrayBuffer());
      audioChunks.push(buffer);
   }

    const finalAudio = Buffer.concat(audioChunks);
    const outputPath = `./audio/${scene.id}.mp3`;
    console.log("outputPath", outputPath);
    
    fs.mkdirSync("./audio", { recursive: true });
    fs.writeFileSync(outputPath, finalAudio);
  
    return outputPath;
}

    describe("Step 6 – generateSceneAudio", () => {
        scene = {
            id: "scene_test_01",
            heading: "INT. CABIN - NIGHT",
            dialogue: [
            {
                character: "NARRATOR",
                text: "The wind howls outside.",
                voice_id: "EXAVITQu4vr4xnSDxMaL"
            },
            {
                character: "JOHN",
                text: "Did you hear that?",
                voice_id: "EXAVITQu4vr4xnSDxMaL"
            }
            ]
        };
    });

    afterEach(() => {
        if (fs.existsSync("./audio/scene_test_01.mp3")) {
            fs.unlinkSync("./audio/scene_test_01.mp3");
        }
    });

   it("generates a single audio file for a scene", async () => {
    const mockClient = await createMockElevenLabsClient();
    const outputPath =  await generateSceneAudio(scene, mockClient);  //test mock client

    // File exists
    expect(fs.existsSync(outputPath)).toBe(true);

    // File has content
    const stats = fs.statSync(outputPath);
    expect(stats.size).toBeGreaterThan(0);

    // ElevenLabs called once per line
    expect(mockClient.textToSpeech.convert).toHaveBeenCalledTimes(scene.dialogue.length);
   });

  

