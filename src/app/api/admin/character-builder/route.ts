import { NextResponse } from "next/server";
import {buildLLMCharacterInput} from "./step-1-buildLLMCharacterInput";
import {buildCharacterProfilingPrompt} from "./step-2-buildCharacterProfilingPrompt";
import {generateCharacterProfile} from "./step-3-generateCharacterProfile";
import {buildElevenLabsVoicePrompt} from "./step-4-buildElevenLabsVoicePrompt";
import {buildVoiceRankingPrompt} from "./step-5-2-VoiceRankingPrompt";
import {rankVoicesWithClaude} from "./step-5-3-RankVoicesWithClaude";
import {assignVoiceToCharacter} from "./step-5-4-AssignVoiceToCharacter";
//import {AssignElevenLabsAgent} from "./step-5-AssignElevenLabsAgent";
import { AvailableVoices, getAvailableVoices } from "../utils";


const characterName = "SARAH";
const sampleDialogue = [
    "Hello, how are you?",
    "I'm fine, thank you.",
    "What's your name?",
    "My name is Sarah.",
    "Nice to meet you, Sarah.",
];
interface LLMCharacterInput {
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

  
export async function GET() {


    console.log("Character builder route");
    const parsedScreenplay = await getParsedScreenplay();
    const characterName="MARA";

  // await test();
    //1. Generate character profile
   const llmInput = buildLLMCharacterInput(parsedScreenplay, characterName);
    console.log(llmInput)
    //2. Build ElevenLabs voice prompt
    const profilePrompt = buildCharacterProfilingPrompt(llmInput);

    //3. Assign ElevenLabs agent
    const profile = await generateCharacterProfile(llmInput,profilePrompt);
  
    console.log(profile);
    //4. Generate audio
    const voicePrompt = buildElevenLabsVoicePrompt(characterName, profile, llmInput.sampleDialogue);
    console.log("voicePrompt");
    //console.log(voicePrompt);

    //5. Store audio in Supabase
    //TODO: Implement this
    //const audioUrl = await AssignElevenLabsAgent(characterName,voicePrompt);
    const availableVoices = await getAvailableVoices();
    const reasonOutput = await buildVoiceRankingPrompt(profile, availableVoices);
    console.log("reasonOutput");
    //console.log(reasonOutput);
   const rankedVoices = await rankVoicesWithClaude(profile, availableVoices, reasonOutput);
    console.log("rankedVoices");
   console.log(rankedVoices);
   const voiceId = await assignVoiceToCharacter(characterName, profile, availableVoices, rankedVoices.best_voice_id);
   console.log("voiceId");
   console.log(voiceId);
     return NextResponse.json({ ok: true });

}