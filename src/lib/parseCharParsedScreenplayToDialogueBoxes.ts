import { arrayToHashmap } from "./utils";
import {DialogueBoxScene, DialogueBox} from "./types";

export function parseCharParsedScreenplayToDialogueBoxes(CPResults: any, PSResults: any){
    const scenes = PSResults.scenes;
    const dialogue_boxes_scenes: DialogueBoxScene[] = [];
    const characterVoiceIdsHashmap = arrayToHashmap(CPResults.characterVoiceIds);
scenes.map((scene: any)=> console.log("2scene:", scene.id, scene.sceneNumber, scene.heading, scene.characters, scene.dialogue));
    scenes.forEach((scene: any, index: number) => {
        const dialogue_boxes: DialogueBox[] = [];
        scene.dialogue.forEach((box: any)=> {
            /* TBD add default narrator voice id */
            if (box.character =="NARRATOR"){
                dialogue_boxes.push({
                    character_name: "Narrator",
                    voice_id: "",
                    text: box.text,
                    isNarration: true,
                })
            }
            else {
                dialogue_boxes.push({
                    character_name: box.character,
                    voice_id: characterVoiceIdsHashmap.get(box.character),
                    text: box.text,
                    isNarration: false,
                })
            }   
        })
        dialogue_boxes_scenes.push({
            scene_id: scene.id,
            sceneNumber: scene.sceneNumber,
            heading: scene.heading,
            characters: scene.characters,
            dialogue_boxes: dialogue_boxes,
            audio_url: "",
        })
    });
    dialogue_boxes_scenes.forEach((scene: any) => {
        console.log("scene_id", scene.scene_id);
        console.log("scene_number", scene.sceneNumber);
    });
  
    return { dialogue_boxes_scenes, error: null};
}