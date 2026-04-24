
import {DialogueBoxScene} from "@/lib/types";
import { isDatabaseUuid } from "@/lib/isDatabaseUuid";

export async function generateCompleteAudio(dialogue_boxes_scenes: DialogueBoxScene[], parsedScreenplayId: string){
    if (dialogue_boxes_scenes ==null) { return ({audio_url: "", error: "No dialogue boxes scenes provided."}); }
    if (parsedScreenplayId==null || parsedScreenplayId.trim() === "") { return ({audio_url: "", error: "No parsed screenplay id provided."}); }
    if (!isDatabaseUuid(parsedScreenplayId)) { return ({audio_url: "", error: "Parsed screenplay id must be a uuid."}); }
    try{
        console.log("parsedScreenplayId", parsedScreenplayId);
        dialogue_boxes_scenes.map((s)=> console.log("NEW audio dialogue boxes:", s.scene_id, s.heading, s.sceneNumber,s.audio_url));
        return ({audio_url: "https://www.google.com", error: null});
    }
    catch(error){
        console.error("Failed to generate complete audio:", error);
        return ({audio_url: "", error: "Failed to generate complete audio."});
    }
    
}