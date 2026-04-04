import { arrayToHashmap } from "./utils";
import {DialogueBoxScene, DialogueBox} from "./types";

export function parseCharParsedScreenplayToDialogueBoxes(CPResults: any, PSResults: any){
    //console.log("Parsing character parsed screenplay to dialogue boxes:", CPResults);
    const scenes = PSResults.scenes;
    //console.log("scenes:",scenes);
    const dialogue_boxes: DialogueBox[] = [];
    const dialogue_boxes_scenes: DialogueBoxScene[] = [];
    const characterVoiceIdsHashmap = arrayToHashmap(CPResults.characterVoiceIds);
    console.log("characterVoiceIdsHashmap:", characterVoiceIdsHashmap.size);
    characterVoiceIdsHashmap.forEach((value: any, key: any)=>{  
       console.log("key:", key);
       console.log("value:", value);
    });
    const characterVoiceIds = CPResults.characterVoiceIds;
    scenes.forEach((scene: any, index: number) => {
        console.log("scene:", scene.sceneNumber);
        console.log("index:", index);
        scene.dialogue.forEach((box: any)=> {
            //console.log("character:", box.character);
            //console.log("text:", box.text);
            /* TBD add default narrator voice id */
            if (box.character =="NARRATOR"){
                dialogue_boxes.push({
                    character_name: "Narrator",
                    voice_id: "Narrator",
                    text: box.text,
                })
            }
            else {
                console.log(characterVoiceIdsHashmap.get(box.character));
                dialogue_boxes.push({
                    character_name: box.character,
                    voice_id: characterVoiceIdsHashmap.get(box.character),
                    text: box.text,
                })
            }
     
        })
        dialogue_boxes_scenes.push({
            scene_id: scene.sceneNumber,
            dialogue_boxes: dialogue_boxes,

        })
    });
    dialogue_boxes_scenes.forEach((scene: any)=>{
        console.log("SCENE ID::", scene.scene_id);
        scene.dialogue_boxes.forEach((box: any)=>{
            console.log("name:", box.character_name);
            console.log("voice_id:", box.voice_id);
            console.log("text:", box.text)
        })
    })

     
 
    // CPResults.profiles.forEach((profile: any)=> {
    //     const dialogue_boxes = profile;
    //     dialogue_boxes.forEach((box: any)=>{
    //         console.log("box:", box);
    //     })
        // console.log("dialogue_box:", dialogue_box);
        // console.log("profile:", profile.name);
        // console.log("voice_id:",profile.voiceId);
   

    // const dialogue_boxes = PSResults.scenes.map((scene: any) => {
    //     scene.dialogue.map((box: any)=> {
    //         const character_name = box.character_name;
    //         console.log("character_name:", character_name);
    //     })
    // });
        
    return { dialogue_boxes_scenes, error: null};
}