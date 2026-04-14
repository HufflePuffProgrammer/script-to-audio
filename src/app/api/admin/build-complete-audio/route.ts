import { NextResponse } from "next/server";

export async function POST (request: Request){

    try{
        const {dialogue_boxes_scenes} = await request.json();
        if (dialogue_boxes_scenes == null){
            return NextResponse.json({error:"No dialogue boxes scenes provided."},{status:400});
        }
        return NextResponse.json({message: "Build complete audio complete."}, {status:200});
    }
    catch(error){
        console.error("Failed to build: API build-complete-audio error:", error);
        return NextResponse.json({message: "Failed to build: API build-complete-audio error"},{status:500});
    }
}