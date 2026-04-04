import { NextResponse } from "next/server";

export async function POST(request: Request){

    try{


        return NextResponse.json({message:"Hello World"}, {status:200});
     }catch(error){
        console.error("Failed to build: API error", error);
         return NextResponse.json({message: "Failed to build dialogue box"}, {status: 500});
     }
 }