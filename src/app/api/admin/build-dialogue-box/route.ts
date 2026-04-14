import { NextResponse } from "next/server";
import { parseCharParsedScreenplayToDialogueBoxes} from "@/lib/parseCharParsedScreenplayToDialogueBoxes";

export async function POST(request: Request){

    try{
        const {cpResults, psResults} = await request.json();
        if (cpResults == null || psResults == null){
            return NextResponse.json({error: "No Character Builder Profile text provided."}, {status:400});
        }
  
        const  {dialogue_boxes_scenes , error} = parseCharParsedScreenplayToDialogueBoxes(cpResults, psResults);
        console.log("123dialogue_boxes_scenes", dialogue_boxes_scenes);
        if (error){
             return NextResponse.json({error: "Failed to parse character parsed screenplay to dialogue boxes."}, {status: 500});
         }

        return NextResponse.json({dialogue_boxes_scenes,error}, {status:200});
     }catch(error){
        console.error("Failed to build: API error", error);
         return NextResponse.json({message: "Failed to build dialogue box"}, {status: 500});
     }
 }