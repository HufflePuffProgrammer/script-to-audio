
import {DialogueBoxScene} from "@/lib/types";

export async function generateCompleteAudio(dialogue_boxes_scenes: DialogueBoxScene[]){

    try{
        console.log("generateCompleteAudio: BEFORE");
    }
    catch(error){
        console.error("Failed to generate complete audio:", error);
        return ({audio_url: "", error: "Failed to generate complete audio."});
    }
    return ({audio_url: "", error: "No dialogue boxes scenes provided."});
}