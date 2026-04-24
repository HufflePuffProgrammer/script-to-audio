import { NextResponse } from "next/server";
import { generateAudioFromDialogueBoxScene } from "@/lib/audio/generate-audio";
import type { DialogueBoxScene } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("generate-dialogue-box-scene-audio body", body);
    const dialogueBoxScene = body.dialogueBoxScene as DialogueBoxScene | undefined;
    const parsedScreenplayId = body.parsedScreenplayId as string | undefined;
    if (!dialogueBoxScene) {
      return NextResponse.json(
        { audio_url: "", error: "dialogueBoxScene required" },
        { status: 400 },
      );
    }
    if (!parsedScreenplayId || !parsedScreenplayId.trim()) {
      return NextResponse.json(
        { audio_url: "", error: "parsedScreenplayId required" },
        { status: 400 },
      );
    }
    const result = await generateAudioFromDialogueBoxScene(dialogueBoxScene, parsedScreenplayId);
    return NextResponse.json(result);
  } catch (error) {
    console.error("generate-dialogue-box-scene-audio:", error);
    const message = error instanceof Error ? error.message : "Failed to generate audio.";
    return NextResponse.json({ audio_url: "", error: message }, { status: 500 });
  }
}
