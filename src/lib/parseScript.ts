import { narratorLabel,stageDirectionVerbs, stageDirectionPattern, titlePageMarker, headingPattern, characterPattern, ageDescriptorPattern ,narratorOnlyPattern, indentedLinePattern} from "./constants";
import { Scene } from "./types";


const isCharacterLine = (line: string) =>
  characterPattern.test(line) && line === line.toUpperCase();

const canonicalizeCharacterName = (name: string) =>
  name.replace(/\((?:O\.?C\.?|V\.?O\.?|O\.?S\.?)\)/gi, "").trim();

const isStageDirectionLine = (line: string) => {
  const lowerLine = line.toLowerCase();
  return (
    stageDirectionPattern.test(line) ||
    stageDirectionVerbs.some((verb) => lowerLine.includes(verb))
  );
};

const isDescriptionLine = (line: string) => ageDescriptorPattern.test(line);

const makeId = (prefix: string, index: number) =>
  `${prefix}-${index}-${Math.random().toString(16).slice(2, 8)}`;


export function parseScript(text: string) {
  const lines = text.split(/\r?\n/);

  const scenes: Scene[] = [];
  let currentScene: Scene | null = null;
  let activeCharacter: string | null = null;
  /** False until the first INT./EXT. slug — covers title/credits before the first scene. */
  let seenFirstSlug = false;

  
  for (const rawLine of lines) {
    const trimmed = rawLine.trim();
    const leadingWhitespace = rawLine.match(/^(\s*)/)?.[1].length ?? 0;

    if (!trimmed) {
      activeCharacter = null;
      continue;
    }

    if (trimmed === titlePageMarker) {
      activeCharacter = null;
      continue;
    }

    if (narratorOnlyPattern.test(trimmed)) {
      if (!currentScene) {
        /* FADE IN opens the script; use a neutral heading unless a TITLE PAGE scene already exists. */
        currentScene = {
          id: makeId("scene", scenes.length + 1),
          sceneNumber: scenes.length + 1,
          heading: "SCENE",
          characters: [],
          dialogue: [],
        };
      }

      const lastDialogue = currentScene.dialogue[currentScene.dialogue.length - 1];
      if (lastDialogue?.character === narratorLabel && lastDialogue.isNarration) {
        lastDialogue.text = `${lastDialogue.text} ${trimmed}`.trim();
      } else {
        currentScene.dialogue.push({
          character: narratorLabel,
          text: trimmed,
          isNarration: true,
        });
      }
      activeCharacter = null;
      continue;
    }

    if (headingPattern.test(trimmed)) {
      seenFirstSlug = true;
      if (currentScene) scenes.push(currentScene);
      currentScene = {
        id: makeId("scene", scenes.length + 1),
        sceneNumber: scenes.length + 1,
        heading: trimmed,
        characters: [],
        dialogue: [],
      };
      activeCharacter = null;
      continue;
    }

    const isStageOrDescription =
      isStageDirectionLine(trimmed) || isDescriptionLine(trimmed);
    if (isStageOrDescription) {
      activeCharacter = null;
    }

    const canonicalName = isCharacterLine(trimmed)
      ? canonicalizeCharacterName(trimmed)
      : null;

    if (!isStageOrDescription && canonicalName) {
      /* Centered ALL CAPS title lines from PDFs look like character cues but are not. */
      if (!seenFirstSlug) {
        activeCharacter = null;
        if (!currentScene) {
          currentScene = {
            id: makeId("scene", scenes.length + 1),
            sceneNumber: scenes.length + 1,
            heading: "TITLE PAGE",
            characters: [],
            dialogue: [],
          };
        }
        const character = narratorLabel;
        const isNarration = true;
        const lastPre = currentScene.dialogue[currentScene.dialogue.length - 1];
        const appendPre =
          lastPre &&
          lastPre.character === character &&
          lastPre.isNarration === isNarration;
        if (appendPre) {
          lastPre.text = `${lastPre.text} ${trimmed}`.trim();
        } else {
          currentScene.dialogue.push({
            character,
            text: trimmed,
            isNarration,
          });
        }
        continue;
      }
      activeCharacter = canonicalName;
      continue;
    }


    if (!currentScene) {
      currentScene = {
        id: makeId("scene", scenes.length + 1),
        sceneNumber: scenes.length + 1,
        heading: seenFirstSlug ? "SCENE" : "TITLE PAGE",
        characters: [],
        dialogue: [],
      };
    }

    const isIndented = indentedLinePattern.test(rawLine);

    const endsWithColon = trimmed.endsWith(":");

    let character = narratorLabel;
    let isNarration = true;

    if (activeCharacter && !isStageOrDescription && isIndented && !endsWithColon) {
      character = activeCharacter;
      isNarration = false;
    } else {
      activeCharacter = null;
    }

    const lastDialogue = currentScene.dialogue[currentScene.dialogue.length - 1];
    const shouldAppend =
      lastDialogue &&
      lastDialogue.character === character &&
      lastDialogue.isNarration === isNarration;

    if (shouldAppend) {
      lastDialogue.text = `${lastDialogue.text} ${trimmed}`.trim();
    } else {
      currentScene.dialogue.push({
        character,
        text: trimmed,
        isNarration,
      });
    }

    if (character !== narratorLabel && !currentScene.characters.includes(character)) {
      currentScene.characters.push(character);
    }
  }

  if (currentScene) scenes.push(currentScene);

  const characterFirstScene: Record<string, number> = {};
  scenes.forEach((scene) => {
    scene.dialogue.forEach((line) => {
      if (line.character === narratorLabel) return;
      if (!(line.character in characterFirstScene)) {
        characterFirstScene[line.character] = scene.sceneNumber;
      }
    });
  });

  scenes.forEach((scene) => {
    console.log("scene:", scene.heading);
    console.log("id:", scene.id);
    console.log("sceneNumber:", scene.sceneNumber);


    scene.dialogue.forEach((line) => {
      console.log("character:", line.character, "text:",line.text, "isNarration:", line.isNarration);
    });
  });

  return {
    scenes,
    sceneCount: scenes.length,
    characterFirstScene,
    // Future screenplay-level metadata can live here once we infer it
    // from the title page, PDF layout, or an LLM enrichment step.
    // characteristics: {
    //   genre: undefined,
    //   tone: undefined,
    //   setting: undefined,
    //   timePeriod: undefined,
    //   audience: undefined,
    //   themes: [],
    // },
  };
}
