const { ElevenLabsClient,play } = require("elevenlabs");
const fs = require("fs");


const convertMock = jest.fn(() => {
  return Promise.resolve({
    arrayBuffer: () => Uint8Array.from([1, 2, 3, 4, 5]).buffer
  });
});
const sanity = jest.fn(() => 5);
console.log("sanity returns", sanity());
console.log("sanity result", sanity.mock.results[0]);

const elevenlabsObject = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY
});
const audio = await elevenlabsObject.textToDialogue.convert({
  inputs: [
      {
          text: "[cheerfully] Hello, how are you?",
          voiceId: "9BWtsMINqrJLrRacOk9x",
      },
      {
          text: "[stuttering] I'm... I'm doing well, thank you",
          voiceId: "IKne3meq5aSn9XLyUdCD",
      },
  ],
});
  play(audio);
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



async function generateSceneAudio(scene, elevenLabsClient,play) {
  const audioChunks = [];
  let audioStreamTest;
  try {
    console.log("generating test audio");

    audioStreamTest =await elevenLabsClient.textToDialogue.convert({
      inputs: [
          {
              text: "Knock knock",
              voiceId: "JBFqnCBsd6RMkjVDRZzb",
          },
          {
              text: "Who is there?",
              voiceId: "Aw4FAjKCGjjNkVhN1Xmq",
          },
      ],
  });

    // audioStreamTest = await  elevenLabsClient.textToSpeech.convert(
    //   "pNInz6obpgDQGcFmaJgB", 
    //   {
    //     text: "Hello, this is a test.",
    //     modelId: "eleven_multilingual_v2",
    //     outputFormat: "mp3_44100_128",
    //   }
      // 'JBFqnCBsd6RMkjVDRZzb', // voice_id
      // {
      //   text: 'The first move is what sets everything in motion.',
      //   modelId: 'eleven_multilingual_v2',
      //   outputFormat: 'mp3_44100_128', // output_format
      // }
      //)
    if (!audioStreamTest) {
      throw new Error("No audio stream returned from ElevenLabs");
    }
    await play(audioStreamTest);
   // audioChunks.push(Buffer.from(audioStreamTest));

  } catch (err) {
    console.error(`TTS failed for test:`, err);
    throw err;
  } finally {
    // 🧹 Explicit cleanup guard (safe no-op if already closed)
    if (audioStreamTest?.cancel) {
      try {
        await audioStreamTest.cancel();
      } catch (_) {}
    }
  }

    //const finalAudioTest = Buffer.concat(audioChunksTest);
    async function streamToBuffer(stream){
      let chunks = [];
      console.log("streamToBuffer");
      for await (const chunk of stream) {
        chunks.push(Buffer.from(chunk));
        console.log("chunk");
      }
      console.log("chunks");
      return Buffer.concat(chunks);
    }
 // #2 Normalize Stream
    function normalizeAudioStream(result) {
      console.log("normalizeAudioStream");
      console.log("stream:", result);
console.log("is async iterable:", !!result?.[Symbol.asyncIterator]);

      if (!result) throw new Error("No audio returned");

      if (result[Symbol.asyncIterator]) {
        console.log("result[Symbol.asyncIterator]");
        return result;
      }

      if (result.audio && result.audio[Symbol.asyncIterator]) {
        console.log("result.audio && result.audio[Symbol.asyncIterator]");
        return result.audio;
      }

      if (Buffer.isBuffer(result)) {
        console.log("Buffer.isBuffer(result)");
        return Readable.from(result);
      }

      throw new Error("Unsupported ElevenLabs audio response format");
    }

    // #3 Use the normalized stream.
    // #1 Inspect the return type.
    console.log(typeof audioStreamTest, audioStreamTest);
    const normalizedAudioTest = await normalizeAudioStream(audioStreamTest);
    const finalAudioTest = await streamToBuffer(normalizedAudioTest);
    console.log("finalAudioTest");
    const outputPathTest = `./audio/test1.mp3`;

    fs.mkdirSync("./audio", { recursive: true });
    fs.writeFileSync(outputPathTest, finalAudioTest);

  // for (const line of scene.dialogue) {
  //   let audioStream;
  //   console.log("line", line);
  //   console.log("line.voice_id", line.voice_id);
  //   console.log("line.text", line.text);
  //   console.log("line.model_id", line.model_id);
  //   try {
  //     audioStream = await  elevenLabsClient.textToSpeech.convert(
  //         line.voice_id,
  //         {
  //           text: line.text,
  //           model_id: "eleven_multilingual_v2"
  //         }
  //       )
  //     if (!audioStream) {
  //       throw new Error("No audio stream returned from ElevenLabs");
  //     }
  //     audioChunks.push(Buffer.from(audioStream));

  //   } catch (err) {
  //     console.error(`TTS failed for ${line.character}:`, err.message);
  //     throw err;
  //   } finally {
  //     // 🧹 Explicit cleanup guard (safe no-op if already closed)
  //     if (audioStream?.cancel) {
  //       try {
  //         await audioStream.cancel();
  //       } catch (_) {}
  //     }
  //   }
  // }
  //   const finalAudio = Buffer.concat(audioChunks);
  //   const outputPath = `./audio/${scene.id}.mp3`;

  //   fs.mkdirSync("./audio", { recursive: true });
  //   fs.writeFileSync(outputPath, finalAudio);
    return outputPathTest;
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
        //if (convertMock.mock.results.length > 0) {
        //    console.log("convert result", convertMock.mock.results[0]);
        //}
        //convertMock.mockClear();
    });

   it("generates a single audio file for a scene", async () => {
    //const elevenlabsObject = await createMockElevenLabsClient();
    //const outputPath =  await generateSceneAudio(scene, mockClient); -- test mock client
    // const preview = convertMock();
    // console.log("convertMock preview", preview);
    // convertMock.mockClear();
    const outputPath =  await generateSceneAudio(scene, elevenlabsObject,play);

    expect(fs.existsSync(outputPath)).toBe(true);

    // File has content
    const stats = fs.statSync(outputPath);
    expect(stats.size).toBeGreaterThan(0);

    // ElevenLabs called once per line
    //expect(convertMock).toHaveBeenCalledTimes(scene.dialogue.length);
   });
   afterAll(async () => {
    jest.clearAllMocks();
  });
  

