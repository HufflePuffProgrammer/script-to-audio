import { NextResponse } from "next/server";
import { parseCharParsedScreenplayToDialogueBoxes } from "@/lib/parseCharParsedScreenplayToDialogueBoxes";
import { generateAudioFromDialogueBoxScene } from "@/lib/audio/generate-audio";

export async function POST(request: Request) {

  try {
    const { characterProfiles, screenplayResults } = await request.json();
    if (characterProfiles == null || screenplayResults == null) {
      return NextResponse.json(
        { error: "No Character Builder Profile text provided." },
        { status: 400 },
      );
    }
    const { dialogue_boxes_scenes, error } = parseCharParsedScreenplayToDialogueBoxes(
      characterProfiles,
      screenplayResults,
    );
    if (error) {
      return NextResponse.json(
        { error: "Failed to parse character parsed screenplay to dialogue boxes." },
        { status: 500 },
      );
    }
  
    const audio_urls: string[] = [];

    for (const scene of dialogue_boxes_scenes) {
      const {audio_url} = await generateAudioFromDialogueBoxScene(scene,screenplayResults.screenplay_id);
      if (audio_url == ""){
          return NextResponse.json({error: "Failed to generate audio from dialogue box scene."}, {status: 500});
      }
      audio_urls.push(audio_url);

    }
    return NextResponse.json({ audio_urls }, { status: 200 });
  } catch (error) {
      console.error("Failed to generate audio:", error);
      return NextResponse.json({ audio_urls: [] }, { status: 500 });
  }
}
