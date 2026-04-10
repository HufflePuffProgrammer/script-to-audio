import { arrayToHashmap } from "./utils";
import {DialogueBoxScene, DialogueBox} from "./types";

export function parseCharParsedScreenplayToDialogueBoxes(CPResults: any, PSResults: any){
    const scenes = PSResults.scenes;
    const dialogue_boxes: DialogueBox[] = [];
    const dialogue_boxes_scenes: DialogueBoxScene[] = [];
    const characterVoiceIdsHashmap = arrayToHashmap(CPResults.characterVoiceIds);

    scenes.forEach((scene: any, index: number) => {
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
            scene_id: scene.sceneNumber,
            dialogue_boxes: dialogue_boxes,

        })
    });
        
    return { dialogue_boxes_scenes, error: null};
}