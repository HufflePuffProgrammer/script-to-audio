import { parseScript } from "@/lib/parseScript";
import {
  insertScreenplayAction,
  insertSceneAction,
  markScreenplayStage,
} from "@/lib/db/action";
import type { Scene } from "@/lib/types";

export type ParseHandlerResult = {
  scenes: Scene[];
  sceneCount: number;
  characterFirstScene: Record<string, number>;
  screenplay_id: string | null;
};

export async function runParsePipeline(
  text: string,
  ownerId?: string | null,
): Promise<ParseHandlerResult> {
  const { scenes, sceneCount, characterFirstScene } = parseScript(text);
  const screenplayId = await insertScreenplayAction(
    scenes[0]?.heading ?? "Untitled Screenplay",
    text,
    ownerId,
  );

  let scenesOut = scenes;
  if (screenplayId && scenes.length > 0) {
    scenesOut = await insertSceneAction(screenplayId, scenes);
  } else if (screenplayId && scenes.length === 0) {
    await markScreenplayStage(screenplayId, "no_scenes_found");
  }

  return {
    scenes: scenesOut,
    sceneCount,
    characterFirstScene,
    screenplay_id: screenplayId,
  };
}
