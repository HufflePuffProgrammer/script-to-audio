import { NextResponse } from "next/server";
import { parseScript } from "@/lib/parseScript";
import { insertScreenplayData, insertSceneData } from "@/lib/db/data";

export async function POST(request: Request) {
  try {
    const { text } = await request.json();
    if (!text || typeof text !== "string" || !text.trim()) {
      return NextResponse.json({ error: "No screenplay text provided." }, { status: 400 });
    }

    const { scenes, sceneCount, characterFirstScene } = parseScript(text);

    const screenplayId = await insertScreenplayData(
      scenes[0]?.heading ?? "Untitled Screenplay",
      text,
    );

    let scenesOut = scenes;
    if (screenplayId && scenes.length > 0) {
      scenesOut = await insertSceneData(screenplayId, scenes);
    }

    return NextResponse.json(
      {
        scenes: scenesOut,
        sceneCount,
        characterFirstScene,
        screenplay_id: screenplayId,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Parse API error:", error);
    return NextResponse.json({ error: "Failed to parse screenplay." }, { status: 500 });
  }
}
