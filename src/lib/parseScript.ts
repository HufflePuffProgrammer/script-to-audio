import { narratorLabel } from "./constants";
import { Scene } from "./types";

const headingPattern = /^(INT\.|EXT\.)/i;
const characterPattern = /^[A-Z0-9\s.'()\-]{2,40}$/;

const makeId = (prefix: string, index: number) =>
  `${prefix}-${index}-${Math.random().toString(16).slice(2, 8)}`;

export function parseScript(text: string) {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const scenes: Scene[] = [];
  let currentScene: Scene | null = null;
  let currentCharacter: string | null = null;
let currentDialogue: string = "";
let isNewCharacter: boolean = false;

  lines.forEach((line) => {

    if (headingPattern.test(line)) {
      if (currentScene) scenes.push(currentScene);
      currentScene = {
        id: makeId("scene", scenes.length + 1),
        sceneNumber: scenes.length + 1,
        heading: line,
        characters: [],
        dialogue: [],
      };
      currentCharacter = null;
      return;
    }
//console.log("line:",line);
    if (characterPattern.test(line) && line === line.toUpperCase()) {
        console.log("push scene");
        isNewCharacter = true;
      
        currentCharacter = line;
      return;
    }

    if (!currentScene) {
      currentScene = {
        id: makeId("scene", scenes.length + 1),
        sceneNumber: scenes.length + 1,
        heading: "SCENE",
        characters: [],
        dialogue: [],
      };
    }

    const character = currentCharacter ?? narratorLabel;
    const isNarration = !currentCharacter;
    if (isNewCharacter) {
      console.log("push scene",currentCharacter,currentDialogue,"line:",line);
      isNewCharacter = false;
      currentDialogue = "";
    }
    else{
      console.log("join dialogue:");
      console.log("currentCharacter:",currentCharacter);
      console.log("line:",line);
      currentDialogue = currentDialogue + " " + line;
      console.log("currentDialogue:",currentDialogue);
  
    }
    // currentScene.dialogue.push({
    //   character,
    //   text: line,
    //   isNarration,
    // });
    // if (character !== narratorLabel && !currentScene.characters.includes(character)) {
    //   currentScene.characters.push(character);
    // }
    //console.log("line",line);
  });



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
  console.log("scenes");
  scenes.forEach((scene)=>{
  console.log(scene.characters)
console.log(scene.dialogue)
});
console.log("characterFirstScene");
console.log(characterFirstScene);
  return {
    scenes,
    sceneCount: scenes.length,
    characterFirstScene,
  };
}

