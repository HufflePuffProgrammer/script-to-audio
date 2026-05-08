import { NextResponse } from "next/server";
import { parseScriptToCharInput } from "@/lib/parseScriptToCharInput";
import { getAvailableVoices } from "@/lib/audio/getAvailableVoices";
import { buildCharacterProfile } from "@/lib/buildCharacterProfile";
import { getScreenplayData } from "@/lib/db/data";

  export async function POST(request: Request) {
    try {
      const { screenplayId } = await request.json();
      if (!screenplayId || typeof screenplayId !== "string" || !screenplayId.trim()) {
        return NextResponse.json({ error: "No screenplay text provided." }, { status: 400 });
      }

      const availableVoices = await getAvailableVoices();
      const {id, title, raw_text, created_at} = await getScreenplayData(screenplayId);
      if (!id || !title ) {
        return NextResponse.json({error: "Screenplay not found"}, {status:400});
      }
      // parse screenplay to character profile
      const characterInputs = parseScriptToCharInput(raw_text);

      // Build ElevenLabs Character Profile prompt
      const {profiles, characterVoiceIds, profilePrompts} = await buildCharacterProfile(characterInputs, availableVoices, screenplayId);
      if (!profiles || !characterVoiceIds || !profilePrompts) {
        return NextResponse.json({ error: "Failed to build character profile" }, { status: 500 });
      }
      return NextResponse.json({profiles,characterVoiceIds, profilePrompts });
    } catch (error) {
      console.error("Character builder route error", error);
      return NextResponse.json({ error: "Failed to parse screenplay." }, { status: 500 });
    }
}