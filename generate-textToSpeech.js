
//const { ElevenLabsClient,play } = require('@elevenlabs/elevenlabs-js');
// const { Readable } = require('node:stream');
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import { play } from "@elevenlabs/elevenlabs-js";
import { Readable } from "stream";

    

    const client = new ElevenLabsClient({
        apiKey: process.env.ELEVENLABS_API_KEY
    });
  console.log("ElevenLabs client initialized");

 const audio = await client.textToSpeech.convert('JBFqnCBsd6RMkjVDRZzb', {
    text: 'The first move is what sets everything in motion.',
    modelId: 'eleven_multilingual_v2',
    outputFormat: 'mp3_44100_128',
  });

 // await play(audio);
//  const reader = audio.getReader();
//  const stream = new Readable({
//    async read() {
//      const { done, value } = await reader.read();
//      if (done) {
//        this.push(null);
//      } else {
//        this.push(value);
//      }
//    },
//  });

//  await play(stream);

