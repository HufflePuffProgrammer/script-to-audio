import { NextResponse } from "next/server";
import { generateAudioFromDialogueBoxScene } from "@/lib/audio/generate-audio";
export async function POST(request: Request){
    try{
        const {dialogue_boxes_scenes} = await request.json();
        if (dialogue_boxes_scenes ==null){
            return NextResponse.json({error:"No dialogue boxes scenes provided."}, {status: 401});
        }
        const {audio_url, error} = await generateAudioFromDialogueBoxScene(dialogue_boxes_scenes);
        if (audio_url == "" || error){
            return NextResponse.json({error: "Failed to build audio per dialogue box scene."}, {status: 401});
        }
        return NextResponse.json({audio_url}, {status:200});
    }
    catch(error){
        console.error("Failed to build: API error", error);
        return NextResponse.json({message: "Failed to build audio per dialogue box scene"},{status:500});
    }
 }