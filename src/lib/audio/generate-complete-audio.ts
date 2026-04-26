
import {DialogueBoxScene} from "@/lib/types";
import { isDatabaseUuid } from "@/lib/isDatabaseUuid";

export async function generateCompleteAudio(dialogue_boxes_scenes: DialogueBoxScene[], parsedScreenplayId: string){
    if (dialogue_boxes_scenes ==null) { return ({audio_url: "", error: "No dialogue boxes scenes provided."}); }
    if (parsedScreenplayId==null || parsedScreenplayId.trim() === "") { return ({audio_url: "", error: "No parsed screenplay id provided."}); }
    if (!isDatabaseUuid(parsedScreenplayId)) { return ({audio_url: "", error: "Parsed screenplay id must be a uuid."}); }
    try{
        console.log("parsedScreenplayId", parsedScreenplayId);
        dialogue_boxes_scenes.map((s)=> console.log("NEW audio dialogue boxes:", s.scene_id, s.heading, s.sceneNumber,s.audio_url));
        return ({audio_url: "https://lzaplxpcapdkbfbedtks.supabase.co/storage/v1/object/sign/audio/b145eb97-c32c-4646-9818-8feab8c84784/1776969211290.mp3?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8yNjA5N2VjNC05YTA2LTRlNzEtODdlMi05NjY0NTM2MTJjOWYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJhdWRpby9iMTQ1ZWI5Ny1jMzJjLTQ2NDYtOTgxOC04ZmVhYjhjODQ3ODQvMTc3Njk2OTIxMTI5MC5tcDMiLCJpYXQiOjE3NzY5NjkyMTMsImV4cCI6MTc3NzU3NDAxM30.UCAbBuViT25Y3Y2LCXzeRaNwDqHekBlftUWBaTboRzg", error: null});
    }
    catch(error){
        console.error("Failed to generate complete audio:", error);
        return ({audio_url: "", error: "Failed to generate complete audio."});
    }
    
}