import { getSupabaseAdminClient } from "@/lib/supabaseServer";
import { Scene } from "@/lib/types";
import { logDbError } from "@/lib/db/logError";

export async function insertScreenplayAction(
  title: string,
  raw_text: string,
  ownerId?: string | null,
): Promise<string | null> {
  const serverClient = getSupabaseAdminClient();
  if (!serverClient) {
    throw new Error("Supabase admin client not found");
  }
  const { data: screenplayData, error: screenplayError } = await serverClient
    .from("screenplays")
    .insert({
      title,
      raw_text,
      ...(ownerId ? { owner_id: ownerId } : {}),
    })
    .select("id")
    .single();
  if (screenplayError) {
    await logDbError("insertScreenplayAction", screenplayError.message, {
      title,
      raw_text_length: raw_text.length,
      code: screenplayError.code,
    });
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
    await logDbError("insertSceneAction", scenesError.message, {
      screenplay_id: screenplayId,
      scene_count: scenes.length,
      code: scenesError.code,
    });
    await markScreenplayStage(screenplayId, "scenes_parse_failed");
    throw new Error("Failed to insert scenes");
  }

  if (!insertedScenes?.length) {
    return scenes;
  }

  await updateScreenplayStats(screenplayId, scenes);

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
  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    throw new Error("Supabase is not configured");
  }

  const { data, error } = await supabase
    .from("character_voices")
    .upsert({
      screenplay_id: screenplayId,
      character: characterName,
      voice_id: rankedVoiceId,
      description,
      labels,
      reason,
    })
    .select("id")
    .single();

  if (error) {
    await logDbError("upsertVoiceIdToCharacterAction", error.message, {
      screenplay_id: screenplayId,
      character: characterName,
      voice_id: rankedVoiceId,
      code: error.code,
    });
    throw error;
  }
  return data?.id != null ? String(data.id) : rankedVoiceId;
}

async function updateScreenplayStats(
  screenplayId: string,
  scenes: Scene[],
): Promise<void> {
  const supabase = getSupabaseAdminClient();
  if (!supabase || scenes.length === 0) {
    return;
  }

  const characters = new Set<string>();
  for (const scene of scenes) {
    for (const name of scene.characters ?? []) {
      if (name) {
        characters.add(name);
      }
    }
    for (const line of scene.dialogue) {
      if (line.character && !line.isNarration) {
        characters.add(line.character);
      }
    }
  }

  const lastSceneParsed = Math.max(...scenes.map((s) => s.sceneNumber));

  const { error } = await supabase
    .from("screenplays")
    .update({
      scene_count: scenes.length,
      last_scene_parsed: lastSceneParsed,
      number_of_characters: characters.size,
      stage_of_development: "scenes_parsed",
    })
    .eq("id", screenplayId);

  if (error) {
    await logDbError("updateScreenplayStats", error.message, {
      screenplay_id: screenplayId,
      scene_count: scenes.length,
      code: error.code,
    });
    await markScreenplayStage(screenplayId, "stats_update_failed");
  }
}

/** Updates `stage_of_development` on a screenplay (e.g. after parse failure). */
export async function markScreenplayStage(
  screenplayId: string,
  stage: string,
): Promise<void> {
  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    return;
  }

  const { error } = await supabase
    .from("screenplays")
    .update({ stage_of_development: stage })
    .eq("id", screenplayId);

  if (error) {
    await logDbError("markScreenplayStage", error.message, {
      screenplay_id: screenplayId,
      stage,
      code: error.code,
    });
  }
}
