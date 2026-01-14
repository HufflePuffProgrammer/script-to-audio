jest.useRealTimers();

const fs = require("fs");


const convertMock = jest.fn(() => {
  return Promise.resolve({
    arrayBuffer: () => Uint8Array.from([1, 2, 3, 4, 5]).buffer
  });
});
const sanity = jest.fn(() => 5);
console.log("sanity returns", sanity());
console.log("sanity result", sanity.mock.results[0]);
const elevenlabsObject = {
  textToSpeech: { convert: convertMock }
};

var  scene = {
    id: "",
    heading: "",
    dialogue: [
    {
        character: "",
        text: "",
        voice_id: ""
    },
    {
        character: "",
        text: "",
        voice_id: ""
    }
    ]
};
// async function createMockElevenLabsClient() {

//     return {
//       textToSpeech: {
//          convert: jest.fn(async () => ({
//            arrayBuffer: async () =>
//              Uint8Array.from([1, 2, 3, 4, 5]).buffer
//          }))
//       }
//     };
// }
function withTimeout(promise, ms, errorMessage = "Operation timed out") {
  let timeoutId;

  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(errorMessage));
    }, ms);
  });

  return Promise.race([promise, timeoutPromise])
    .finally(() => clearTimeout(timeoutId));
}


async function generateSceneAudio(scene, elevenlabsClient) {
    const audioChunks = [];

 //   for (const line of scene.dialogue) {
      // const audioStream = await elevenlabsClient.textToSpeech.convert(
      //   line.voice_id,
      //   {
      //     text: line.text,
      //     model_id: "eleven_multilingual_v2"
      //   }
      // );
      // const buffer = Buffer.from(await audioStream.arrayBuffer());
      // audioChunks.push(buffer);
 //   }
 for (const line of scene.dialogue) {
  let audioStream;

  try {
    audioStream = await withTimeout(
      elevenlabsClient.textToSpeech.convert(
        line.voice_id,
        {
          text: line.text,
          model_id: "eleven_multilingual_v2"
        }
      ),
      10_000, // 10s per line
      "ElevenLabs TTS request timed out"
    );

    // 🔑 FULLY consume the stream
    const arrayBuffer = await withTimeout(
      audioStream.arrayBuffer(),
      10_000,
      "ElevenLabs audio stream read timed out"
    );

    audioChunks.push(Buffer.from(arrayBuffer));
  } catch (err) {
    console.error(`TTS failed for ${line.character}:`, err.message);
    throw err;
  } finally {
    // 🧹 Explicit cleanup guard (safe no-op if already closed)
    if (audioStream?.cancel) {
      try {
        await audioStream.cancel();
      } catch (_) {}
    }
  }
}


    const finalAudio = Buffer.concat(audioChunks);
    const outputPath = `./audio/${scene.id}.mp3`;

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
        if (convertMock.mock.results.length > 0) {
            console.log("convert result", convertMock.mock.results[0]);
        }
        convertMock.mockClear();
    });

   it("generates a single audio file for a scene", async () => {
    //const elevenlabsObject = await createMockElevenLabsClient();
    //const outputPath =  await generateSceneAudio(scene, mockClient); -- test mock client
    const preview = convertMock();
    console.log("convertMock preview", preview);
    convertMock.mockClear();
    const outputPath =  await generateSceneAudio(scene, elevenlabsObject);

    expect(fs.existsSync(outputPath)).toBe(true);

    // File has content
    const stats = fs.statSync(outputPath);
    expect(stats.size).toBeGreaterThan(0);

    // ElevenLabs called once per line
    expect(convertMock).toHaveBeenCalledTimes(scene.dialogue.length);
   });
   afterAll(async () => {
    jest.clearAllMocks();
  });
  

