import { NextResponse } from "next/server";
import { parseScript } from "@/lib/parseScript";
import { getSupabaseAdminClient } from "@/lib/supabaseServer";

export async function POST(request: Request) {
  try {
    const { text } = await request.json();
    if (!text || typeof text !== "string" || !text.trim()) {
      return NextResponse.json({ error: "No screenplay text provided." }, { status: 400 });
    }

    const parsed = parseScript(text);

    const supabase = getSupabaseAdminClient();
    let screenplayId: string | null = null;

    if (supabase) {
      const { data: screenplayRow, error: screenplayError } = await supabase
        .from("screenplays")
        .insert({
          title: parsed.scenes[0]?.heading ?? "Untitled Screenplay",
          raw_text: text,
        })
        .select("id")
        .single();

      if (screenplayError) {
        console.error("Supabase insert screenplay failed:", screenplayError);
      } else {
        screenplayId = screenplayRow?.id ?? null;
      }

      if (screenplayId && parsed.scenes.length > 0) {
        const sceneRows = parsed.scenes.map((scene) => ({
          screenplay_id: screenplayId,
          scene_number: scene.sceneNumber,
          heading: scene.heading ?? null,
          dialogue: scene.dialogue,
        }));

        const { error: scenesError } = await supabase
          .from("scenes")
          .insert(sceneRows);

        if (scenesError) {
          console.error("Supabase insert scenes failed:", scenesError);
        }
      }
    }

    return NextResponse.json({
      scenes: parsed.scenes,
      sceneCount: parsed.sceneCount,
      characterFirstScene: parsed.characterFirstScene,
      screenplay_id: screenplayId,
    });
  } catch (error) {
    console.error("Parse API error:", error);
    return NextResponse.json({ error: "Failed to parse screenplay." }, { status: 500 });
  }
}

