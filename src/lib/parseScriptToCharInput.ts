import { characterPattern, headingPattern } from "./constants";
import { CharacterInput } from "./types";

const isCharacterLine = (line: string) =>
  characterPattern.test(line) && line === line.toUpperCase();

const canonicalizeCharacterName = (name: string) =>
  name.replace(/\(O\.?S\.?\)/gi, "").trim();

const stageDirectionPattern = /^(CLOSE ON|ANGLE ON|CUT TO|PAN TO|DISSOLVE TO|FADE (IN|OUT)|CAMERA|A VOICE)/i;
const stageDirectionVerbs = [
  "opens",
  "bursts",
  "walks",
  "runs",
  "stands",
  "sits",
  "comes",
  "goes",
  "arrives",
  "enters",
  "exits",
  "rushes",
  "throws",
  "carries",
  "leans",
  "holds",
  "grabs",
  "points",
  "shouts",
  "whispers",
  "smiles",
  "laughs",
  "stares",
  "gazes",
  "falls",
  "spins",
  "flips",
  "opens",
  "slams",
  "breaks",
];
const isStageDirectionLine = (line: string) => {
  const lowerLine = line.toLowerCase();
  return (
    stageDirectionPattern.test(line) ||
    stageDirectionVerbs.some((verb) => lowerLine.includes(verb))
  );
};
const ageDescriptorPattern = /\((?:\s*\d{1,3}s|\s*\d{1,3} ?years|[^)]*(?:years old|yrs old|year old))\b/i;
const isDescriptionLine = (line: string) => ageDescriptorPattern.test(line);

export function parseScriptToCharInput(text: string) {
  const lines = text.split(/\r?\n/);
  const characterInputs: CharacterInput[] = [];

  let sceneContextLines: string[] = [];
  let sceneCharacterDialogues = new Map<string, string[]>();
  let sceneCharacterOrder: string[] = [];
  let activeCharacter: string | null = null;
  const indentedLinePattern = /^\s{2,}/;

  const getSceneContext = () =>
    sceneContextLines.filter(Boolean).join("\n").trim();

  const flushScene = () => {
    const sceneContext = getSceneContext();
    for (const character of sceneCharacterOrder) {
      const dialogue = sceneCharacterDialogues.get(character) ?? [];
      characterInputs.push({
        character,
        sceneContext,
        dialogue,
      });
    }
    sceneCharacterDialogues.clear();
    sceneCharacterOrder = [];
    sceneContextLines = [];
    activeCharacter = null;
  };

  for (const rawLine of lines) {
    const trimmedLine = rawLine.trim();
    if (!trimmedLine) {
      activeCharacter = null;
      continue;
    }

    if (headingPattern.test(trimmedLine)) {
      flushScene();
      continue;
    }

    if (isCharacterLine(trimmedLine)) {
      const canonicalName = canonicalizeCharacterName(trimmedLine);
      activeCharacter = canonicalName;
      if (!sceneCharacterDialogues.has(canonicalName)) {
        sceneCharacterDialogues.set(canonicalName, []);
        sceneCharacterOrder.push(canonicalName);
      }
      continue;
    }

    if (activeCharacter && (isStageDirectionLine(trimmedLine) || isDescriptionLine(trimmedLine))) {
      sceneContextLines.push(rawLine.trim());
      activeCharacter = null;
      continue;
    }

    const isIndented = indentedLinePattern.test(rawLine);
    console.log("isIndented:", isIndented,"rawLine:",rawLine);
    if (activeCharacter && isIndented) {
      sceneContextLines.push(rawLine.trim());
      activeCharacter = null;
      continue;
    }

    const endsWithColon = trimmedLine.endsWith(":");
    if (!activeCharacter || endsWithColon) {
      sceneContextLines.push(rawLine.trim());
      activeCharacter = null;
      continue;
    }

    if (activeCharacter) {
      const dialogue = sceneCharacterDialogues.get(activeCharacter);
      dialogue?.push(trimmedLine);
    }
  }

  if (sceneCharacterOrder.length) {
    flushScene();
  }

  return characterInputs;
}