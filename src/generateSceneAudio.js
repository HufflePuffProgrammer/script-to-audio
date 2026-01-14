
  async function generateSceneAudio() {
  const audioChunks = [];

  // for (const line of scene.dialogue) {
  //   const audioStream = await elevenlabsClient.textToSpeech.convert(
  //     line.voice_id,
  //     {
  //       text: line.text,
  //       model_id: "eleven_multilingual_v2"
  //     }
  //   );

  //   const buffer = Buffer.from(await audioStream.arrayBuffer());
  //   audioChunks.push(buffer);
  // }

  // const finalAudio = Buffer.concat(audioChunks);
  // const outputPath = `./audio/${scene.id}.mp3`;
  const outputPath = `./audio/scene_test_01.mp3`;
  console.log("outputPath");
  console.log(outputPath);
  // fs.mkdirSync("./audio", { recursive: true });
  // fs.writeFileSync(outputPath, finalAudio);

  return outputPath;
  //return;
}
