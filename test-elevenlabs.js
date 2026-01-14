// //const { ElevenLabsClient, play } = require("elevenlabs");
// import { ElevenLabsClient, play } from "@elevenlabs/elevenlabs-js";
// const client = new ElevenLabsClient({
//   apiKey: process.env.ELEVENLABS_API_KEY
// });

// console.log("ElevenLabs client initialized");
// try {
//   const audio = await client.textToDialogue.convert({
//     // inputs: [
//     //     {
//     //         text: "Hello, how are you?",
//     //         voiceId: "9BWtsMINqrJLrRacOk9x",
//     //     },
//     //     {
//     //         text: "I'm... I'm doing well, thank you",
//     //         voiceId: "IKne3meq5aSn9XLyUdCD",
//     //     },
//     // ],
//     inputs: [
//       {
//           text: "Knock knock",
//           voiceId: "JBFqnCBsd6RMkjVDRZzb",
//       },
//       {
//           text: "Who is there?",
//           voiceId: "Aw4FAjKCGjjNkVhN1Xmq",
//       },
//   ],

// });
//   await play(audio);
// } catch (error) {
//   console.error("Error:", error);
// }


const { ElevenLabsClient } = require('@elevenlabs/elevenlabs-js');

const client = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY
});

console.log("ElevenLabs client initialized");

// const audio = await elevenlabs.textToSpeech.convert(
//   'JBFqnCBsd6RMkjVDRZzb', // voice_id
//   {
//     text: 'The first move is what sets everything in motion.',
//     modelId: 'eleven_multilingual_v2',
//     outputFormat: 'mp3_44100_128', // output_format
//   }
// );

// await play(audio);