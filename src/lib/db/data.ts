
import { getSupabaseAdminClient } from "@/lib/supabaseServer";
import { Scene } from "@/lib/types";

/** Row shape returned from `screenplays` table selects. */
export type ScreenplayDbRow = {
  id: string;
  title: string | null;
  raw_text: string | null;
  created_at: string;
};

export async function getScreenplayData(
  screenplayId: string,
): Promise<ScreenplayDbRow> {
  const serverClient = getSupabaseAdminClient();
  if (!serverClient) {
    throw new Error("Supabase admin client not found");
  }
  const { data: screenplayData, error: screenplayError } = await serverClient
    .from("screenplays")
    .select("id, title, raw_text, created_at")
    .eq("id", screenplayId)
    .single();
  if (screenplayError) {
    console.error("Failed to get screenplay data", screenplayError);
    throw new Error("Failed to get screenplay data");
  }
  return {
    id: screenplayData.id,
    title: screenplayData.title,
    raw_text: screenplayData.raw_text,
    created_at: screenplayData.created_at,
  };
}

export async function insertScreenplayData(
  title: string,
  raw_text: string,
): Promise<string | null> {
  const serverClient = getSupabaseAdminClient();
  if (!serverClient) {
    throw new Error("Supabase admin client not found");
  }
  const { data: screenplayData, error: screenplayError } = await serverClient
    .from("screenplays")
    .insert({ title, raw_text })
    .select("id")
    .single();
  if (screenplayError) {
    console.error("Failed to insert screenplay data", screenplayError);
    throw new Error("Failed to insert screenplay data");
  }
  return screenplayData?.id ?? null;
}

/**
 * Inserts parsed scenes for a screenplay and returns the same scenes with DB `id` on each row.
 */
export async function insertSceneData(
  screenplayId: string,
  scenes: Scene[],
): Promise<Scene[]> {
  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    throw new Error("Supabase admin client not found");
  }

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
    throw new Error("Failed to insert scenes");
  }

  if (!insertedScenes?.length) {
    return scenes;
  }

  return scenes.map((scene) => {
    const row = insertedScenes.find(
      (r) => r.scene_number === scene.sceneNumber,
    );
    return row ? { ...scene, id: row.id } : scene;
  });
}
