import { NextResponse } from "next/server";
import { parseScriptToCharInput } from "@/lib/parseScriptToCharInput";
import {buildLLMCharacterInput} from "./step-1-buildLLMCharacterInput";
import {buildCharacterProfilingPrompt} from "./step-2-buildCharacterProfilingPrompt";
import {generateCharacterProfile} from "./step-3-generateCharacterProfile";
import {buildVoicePrompt} from "./step-4-buildVoicePrompt";
import {buildVoiceRankingPrompt} from "./step-5-2-VoiceRankingPrompt";
import {rankVoicesWithClaude} from "./step-5-3-RankVoicesWithClaude";
import {assignVoiceToCharacter} from "./step-5-4-AssignVoiceToCharacter";
import {AssignElevenLabsAgent} from "./step-5-1-AssignElevenLabsAgent";
import { AvailableVoices, getAvailableVoices } from "../utils";



export interface LLMCharacterInput {
    character: string;
    genre: string;
    profilingSceneLimit: number;
    sceneContext: string[];
    sampleDialogue: string[];
  };
  interface ReasonOutput{
    best_voice_id: string;
    reason: string;
  };
//   export interface CharacterProfile {
//     age: string;
//     gender: string;
//     traits: string;
//     voiceStyle: string;
//     speechPattern: string;
//     tone: string;
//     confidence?: string;
//   };
//   export interface AvailableVoices{
//     voice_id: string;
//     description: string;
//     labels: string;
//   }[]=[{
//     voice_id: "",
//     description: "",
//     labels: "",
//   }];
  
async function getParsedScreenplay() {
    console.log("Getting parsed screenplay");
    return {
        name: "John Doe",
        age: 30,
        gender: "Male",
    }
}
/**
 * Fetch all ElevenLabs voices
 */

  
// export async function GET() {
  export async function POST(request: Request) {
    try {
      const { text } = await request.json();
      if (!text || typeof text !== "string" || !text.trim()) {
        return NextResponse.json({ error: "No screenplay text provided." }, { status: 400 });
      }
      const parsedScreenplay = parseScriptToCharInput(text);
      return NextResponse.json({ parsedScreenplay });
    } catch (error) {
      console.error("Character builder route error", error);
      return NextResponse.json({ error: "Failed to parse screenplay." }, { status: 500 });
    }

    console.log("Character builder route");
/*****
    const parsedScreenplay = await getParsedScreenplay();
    const characterName="Kyler";

 
    //1. Generate character profile
   const llmInput = buildLLMCharacterInput(parsedScreenplay);
 
    //2. Build ElevenLabs voice prompt
    const profilePrompt = buildCharacterProfilingPrompt(llmInput);

    //3. Assign ElevenLabs agent
    const profile = await generateCharacterProfile(llmInput,profilePrompt);
  
    //4. Voice Prompt
    const voicePrompt = buildVoicePrompt(characterName, profile, llmInput.sampleDialogue);


    //5. Store audio in Supabase
    //TODO: Implement this
    //const audioUrl = await AssignElevenLabsAgent(characterName,voicePrompt);
    //console.log("audioUrl");
    //console.log(audioUrl);

    //5-1 Get Available Voices
    const availableVoices = await getAvailableVoices();

    //5-2 Voice Ranking Prompt
    const voiceRankingPrompt = await buildVoiceRankingPrompt(profile, availableVoices);

    //5-3 Rank Voices with Claude
    const bestRankedVoice = await rankVoicesWithClaude(profile, availableVoices, voiceRankingPrompt);

    console.log("bestRankedVoice");
    console.log(bestRankedVoice);
****/
    //6- Assign Voice to Character. Upsert to database
   //const voiceId = await assignVoiceToCharacter(characterName, profile, bestRankedVoice.best_voice_id, bestRankedVoice.reason);
  // console.log("voiceId");
  // console.log(voiceId);
     return NextResponse.json({ 
      ok: true 
    });

    //  NextResponse.json({
    //   scenes: parsed.scenes,
    //   sceneCount: parsed.sceneCount,
    //   characterFirstScene: parsed.characterFirstScene,
    //   screenplay_id: screenplayId,
    // });

}