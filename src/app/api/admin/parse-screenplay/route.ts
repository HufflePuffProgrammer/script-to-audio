import { NextResponse } from "next/server";
import { parseScript } from "@/lib/parseScript";
import { getSupabaseAdminClient } from "@/lib/supabaseServer";
import type { Scene } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const { text } = await request.json();
    if (!text || typeof text !== "string" || !text.trim()) {
      return NextResponse.json({ error: "No screenplay text provided." }, { status: 400 });
    }

    const { scenes, sceneCount, characterFirstScene } = parseScript(text);
    let scenesOut: Scene[] = scenes;
    const supabase = getSupabaseAdminClient();
    let screenplayId: string | null = null;

    if (supabase) {
      const { data: screenplayRow, error: screenplayError } = await supabase
        .from("screenplays")
        .insert({
          title: scenes[0]?.heading ?? "Untitled Screenplay",
          raw_text: text,
        })
        .select("id")
        .single();

      if (screenplayError) {
        console.error("Supabase insert screenplay failed:", screenplayError);
      } else {
        screenplayId = screenplayRow?.id ?? null;
      }

      if (screenplayId && scenes.length > 0) {
        const sceneRows = scenes.map((scene) => ({
          screenplay_id: screenplayId,
          scene_number: scene.sceneNumber,
          heading: scene.heading ?? null,
          dialogue: scene.dialogue,
        }));

        const { data: insertedScenes, error: scenesError } = await supabase
          .from("scenes")
          .insert(sceneRows)
          .select("id, scene_number");

        if (scenesError) {
          console.error("Supabase insert scenes failed:", scenesError);
        } else if (insertedScenes?.length) {
          scenesOut = scenes.map((scene) => {
            const row = insertedScenes.find((r) => r.scene_number === scene.sceneNumber);
            return row ? { ...scene, id: row.id } : scene;
          });
        }
      }
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
