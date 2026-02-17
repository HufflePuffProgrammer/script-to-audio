import { narratorLabel, characterPattern, headingPattern } from "./constants";
import { Scene,CharacterInput } from "./types";



const makeId = (prefix: string, index: number) =>
  `${prefix}-${index}-${Math.random().toString(16).slice(2, 8)}`;

export function parseScriptToCharInput(text: string) {

    const lines = text
    .split(/\r?\n/)
    //.map((l) => l.trim())
    //.filter(Boolean);


    const scenes: Scene[] = [];
    const characterInputs: CharacterInput[] = [];
    const charactersOfScene: Record<string,number> = {};
    let currentScene: Scene | null = null;
    let currentCharacter: string | null = null;
    let currentDialogue: string = "";
    let isNewCharacter: boolean = false;

console.log("parseScriptToCharInput");
console.log("lines",lines.length);
    lines.forEach((line)=> {
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

        if (characterPattern.test(line) && line === line.toUpperCase()) {
           isNewCharacter = true;
            currentCharacter = line;
            console.log("new character:",currentCharacter);
            characterInputs.push({
                character: currentCharacter,
                genre: "Unknown",
                profilingSceneLimit: 1,
                sceneContext: [],
                sampleDialogue: [],
            });
            charactersOfScene[currentCharacter] = characterInputs.length;
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
            isNewCharacter = false;
            currentDialogue = "";
        }
        else{
            currentDialogue = currentDialogue + " " + line;
           // characterInputs
            console.log("character", character);
            console.log("index", charactersOfScene[character]);
            console.log("line:",line);
            charactersOfScene[character] ??= 0;
            console.log("index 2:", charactersOfScene[character]);
           characterInputs[charactersOfScene[character]].sampleDialogue.push(line);
        
        }
        //if (isNarration) console.log("narration:",line);
       // console.log("character", character);
        //console.log("line:",line);

        currentScene.dialogue.push({
            character,
            text: line,
            isNarration,
                });
        if (character !== narratorLabel && !currentScene.characters.includes(character)) {

        currentScene.characters.push(character);
        }
    //console.log("line",line);
    });

    if (currentScene) scenes.push(currentScene);


    console.log("number of scenes after push:",scenes.length);
    scenes.forEach((scene)=> {
        console.log("scene:",scene.heading);
        console.log("characters", scene.characters.join(" ,"));
        //console.log("dialogue", scene.dialogue.join("\n"));
    });
    for (const character in Object.keys(charactersOfScene)){
        console.log("character:",character);
    }
    for (const index in Object.values(charactersOfScene)) {
        console.log("index:",index);
    }
    // characterInputs.forEach((characterInput)=> {
    //     console.log("characterInput:",characterInput.character);
    //     //console.log("sampleDialogue:",characterInput.sampleDialogue.join("\n"));
    // });
return characterInputs;
}