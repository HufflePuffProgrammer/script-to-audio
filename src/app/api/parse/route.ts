import { NextResponse } from "next/server";
import { parseScript } from "@/lib/parseScript";

export async function POST(request: Request) {
  try {
    const { text } = await request.json();
    if (!text || typeof text !== "string" || !text.trim()) {
      return NextResponse.json({ error: "No screenplay text provided." }, { status: 400 });
    }

    const parsed = parseScript(text);
    console.log("parsed",parsed);
    return NextResponse.json({
      scenes: parsed.scenes,
      sceneCount: parsed.sceneCount,
      characterFirstScene: parsed.characterFirstScene,
    });
  } catch (error) {
    console.error("Parse API error:", error);
    return NextResponse.json({ error: "Failed to parse screenplay." }, { status: 500 });
  }
}

