
import { getSupabaseAdminClient } from "@/lib/supabaseServer";
import { Scene } from "@/lib/types";


export async function insertScreenplayAction(
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
export async function insertSceneAction(
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

/**
 * Upserts the voice_id for a character to the character_voices table.
 * Returns the id of the inserted row or the rankedVoiceId if the upsert failed.
 */
export async function upsertVoiceIdToCharacterAction(
  screenplayId: string,
  characterName: string,
  rankedVoiceId: string,
  description: string,
  labels: string,
  reason: string,
): Promise<string> {

  const supabase = await getSupabaseAdminClient();
  if (!supabase) {
    throw new Error("Supabase is not configured");
  }

  const {data, error} = await supabase
  .from("character_voices")
  .upsert({
    screenplay_id: screenplayId,
    character: characterName,
    voice_id: rankedVoiceId,
    description: description,
    labels: labels,
    reason: reason,
  })
  .select("id")
  .single();

  if (error) {
    console.error("upsertVoiceIdToCharacter:error:", error);
    throw error;
  }
  return data?.id != null ? String(data.id) : rankedVoiceId;

}