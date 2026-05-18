import { NextResponse } from "next/server";
import { parseScriptToCharInput } from "@/lib/parseScriptToCharInput";
import { getAvailableVoices } from "@/lib/audio/getAvailableVoices";
import { buildCharacterProfile } from "@/app/api/admin/character-builder/buildCharacterProfile";
import { getScreenplayData } from "@/lib/db/data";

  export async function POST(request: Request) {
    try {
      const { screenplayId } = await request.json();
      console.log("screenplayId: ", screenplayId);
      if (!screenplayId || typeof screenplayId !== "string" || !screenplayId.trim()) {
        return NextResponse.json({ error: "No screenplay text provided." }, { status: 400 });
      }

      const availableVoices = await getAvailableVoices();
      const row = await getScreenplayData(screenplayId);
      if (!row.id || row.title == null || row.title === "") {
        return NextResponse.json({ error: "Screenplay not found" }, { status: 400 });
      }
      const raw_text = row.raw_text ?? "";
      const characterInputs = parseScriptToCharInput(raw_text);

      const built = await buildCharacterProfile(
        characterInputs,
        availableVoices,
        screenplayId,
      );
      if (!built) {
        return NextResponse.json(
          { error: "Failed to build character profile" },
          { status: 500 },
        );
      }
      const { profiles, characterVoiceIds, profilePrompts } = built;
      return NextResponse.json({ profiles, characterVoiceIds, profilePrompts });
    } catch (error) {
      console.error("Character builder route error", error);
      return NextResponse.json({ error: "Failed to parse screenplay." }, { status: 500 });
    }
}