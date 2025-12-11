import { NextResponse } from "next/server";
import { getElevenLabsClient } from "@/lib/elevenlabsClient";
import { DialogueLine } from "@/lib/types";
import { Readable } from "node:stream";
import { ReadableStream as WebReadableStream } from "node:stream/web";

type Body = {
  scene_id: string;
  dialogue: DialogueLine[];
};

// Fallback voice IDs (replace with mapped Agents when available)
const DEFAULT_VOICE_ID = "EXAVITQu4vr4xnSDxMaL"; // Adam
const ALT_VOICE_ID = "MF3mGyEYCl7XYWbV9V6O"; // Bella
const pickVoice = (character: string, index: number) => {
  // Simple alternating voice assignment; replace with Agent mapping later
  return index % 2 === 0 ? DEFAULT_VOICE_ID : ALT_VOICE_ID;
};

const toBuffer = async (audio: unknown) => {
  // ElevenLabs SDK 2.x returns a Web ReadableStream; older versions returned Uint8Array
  if (!audio) throw new Error("No audio returned from ElevenLabs");

  // Web ReadableStream (preferred path for SDK 2.x)
  if (typeof Readable.fromWeb === "function" && audio instanceof WebReadableStream) {
    const nodeStream = Readable.fromWeb(audio);
    const chunks: Buffer[] = [];
    for await (const chunk of nodeStream) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    return Buffer.concat(chunks);
  }

  // Node stream (just in case)
  if (audio instanceof Readable) {
    const chunks: Buffer[] = [];
    for await (const chunk of audio) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    return Buffer.concat(chunks);
  }

  // ArrayBuffer / Uint8Array fallbacks
  if (audio instanceof ArrayBuffer) {
    return Buffer.from(audio);
  }
  if (ArrayBuffer.isView(audio)) {
    return Buffer.from(audio.buffer);
  }
  if (typeof (audio as any)?.arrayBuffer === "function") {
    const ab = await (audio as any).arrayBuffer();
    return Buffer.from(ab);
  }

  throw new Error("Unsupported audio payload type from ElevenLabs");
};

export async function POST(request: Request) {
  try {
    const { scene_id: sceneId, dialogue }: Body = await request.json();
    if (!sceneId || typeof sceneId !== "string") {
      return NextResponse.json({ error: "scene_id required" }, { status: 400 });
    }
    if (!dialogue || !Array.isArray(dialogue) || dialogue.length === 0) {
      return NextResponse.json({ error: "dialogue array required" }, { status: 400 });
    }

    const client = getElevenLabsClient();

    // Use textToDialogue for multi-speaker synthesis
    const audio = await client.textToDialogue.convert({
      inputs: dialogue.map((line, idx) => ({
        text: line.text,
        voiceId: pickVoice(line.character, idx),
      })),
    });

    // Normalize to Buffer regardless of SDK return type, then return as base64 data URL
    const audioBuffer = await toBuffer(audio as unknown);
    const base64 = audioBuffer.toString("base64");
    const audioUrl = `data:audio/mpeg;base64,${base64}`;

    return NextResponse.json({ audio_url: audioUrl });
  } catch (error) {
    console.error("Generate audio API error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to generate audio.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

