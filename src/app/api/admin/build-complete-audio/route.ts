import { generateCompleteAudio } from "@/lib/audio/generate-complete-audio";
import { NextResponse } from "next/server";
import { isDatabaseUuid } from "@/lib/isDatabaseUuid";
export async function POST (request: Request){

    try{
        const {dialogue_boxes_scenes,parsedScreenplayId} = await request.json();
        if (dialogue_boxes_scenes == null){
            return NextResponse.json({error:"No dialogue boxes scenes provided."},{status:400});
        }
        if (parsedScreenplayId==null || parsedScreenplayId.trim() === "") 
        {
            return NextResponse.json({error:"No parsed screenplay id provided."},{status:400});
        }
        if (!isDatabaseUuid(parsedScreenplayId)){
            return NextResponse.json({error:"Parsed screenplay id must be a uuid."},{status:400});
        }
        const {audio_url, error} = await generateCompleteAudio(dialogue_boxes_scenes,parsedScreenplayId);
        if (audio_url =="" || error){
            return NextResponse.json({error:"Failed to build complete audio."},{status:500});
        }
        return NextResponse.json({message: "Build complete audio complete."}, {status:200});
    }
    catch(error){
        console.error("Failed to build: API build-complete-audio error:", error);
        return NextResponse.json({message: "Failed to build: API build-complete-audio error"},{status:500});
    }
}