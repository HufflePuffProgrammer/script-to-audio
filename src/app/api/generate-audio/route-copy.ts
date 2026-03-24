import { NextResponse } from "next/server";
import { getElevenLabsClient } from "@/lib/elevenlabsClient";
import { DialogueLine } from "@/lib/types";
import { narratorLabel } from "@/lib/constants";
import { getSupabaseAdminClient } from "@/lib/supabaseServer";
import { Readable } from "node:stream";
import { ReadableStream as WebReadableStream } from "node:stream/web";

type Body = {
  scene_id: string;
  dialogue: DialogueLine[];
};

// Fallback voice IDs with optional env overrides (replace with Agent mapping later)
const DEFAULT_VOICE_ID =
  process.env.ELEVENLABS_VOICE_DEFAULT_ID ?? "EXAVITQu4vr4xnSDxMaL"; // Adam
const ALT_VOICE_ID =
  process.env.ELEVENLABS_VOICE_ALT_ID ?? "MF3mGyEYCl7XYWbV9V6O"; // Bella
const NARRATOR_VOICE_ID =
  process.env.ELEVENLABS_VOICE_NARRATOR_ID ?? DEFAULT_VOICE_ID;
const AUDIO_BUCKET = process.env.SUPABASE_AUDIO_BUCKET ?? "audio";

const VOICE_POOL = [DEFAULT_VOICE_ID, ALT_VOICE_ID].filter(Boolean);

const normalizeCharacter = (character?: string) =>
  (character || narratorLabel).trim().toUpperCase();

const genderHint = (text: string) => {
  const lower = text.toLowerCase();
  const maleHints = [" he ", " his ", " him ", " man", " male", " boy", " dad", " father", " mr."];
  const femaleHints = [" she ", " her ", " hers ", " woman", " female", " girl", " mom", " mother", " ms.", " mrs."];

  for (const hint of maleHints) {
    if (lower.includes(hint)) return "male" as const;
  }
  for (const hint of femaleHints) {
    if (lower.includes(hint)) return "female" as const;
  }
  return null;
};

const hashString = (value: string) => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0; // force 32-bit
  }
  return Math.abs(hash);
};

const buildVoiceMap = (dialogue: DialogueLine[]) => {
  const aggregated = new Map<string, string>();
  for (const line of dialogue) {
    const name = normalizeCharacter(line.character);
    const existing = aggregated.get(name) ?? "";
    aggregated.set(name, `${existing} ${line.text}`.trim());
  }

  const map = new Map<string, string>();
  const narratorText = aggregated.get(narratorLabel) ?? "";

  for (const [name, text] of aggregated.entries()) {
    if (name === narratorLabel) {
      map.set(name, NARRATOR_VOICE_ID);
      continue;
    }

    if (VOICE_POOL.length === 0) {
      map.set(name, DEFAULT_VOICE_ID);
      continue;
    }

    const hints = genderHint(` ${text} ${narratorText} `);
    if (hints === "male") {
      map.set(name, DEFAULT_VOICE_ID);
      continue;
    }
    if (hints === "female") {
      map.set(name, ALT_VOICE_ID || DEFAULT_VOICE_ID);
      continue;
    }

    const voiceIndex = hashString(`${name}:${text}`) % VOICE_POOL.length;
    map.set(name, VOICE_POOL[voiceIndex] ?? DEFAULT_VOICE_ID);
  }

  return map;
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
  const arrayBufferLike = audio as { arrayBuffer?: () => Promise<ArrayBuffer> };
  if (typeof arrayBufferLike.arrayBuffer === "function") {
    const ab = await arrayBufferLike.arrayBuffer();
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
    const voiceMap = buildVoiceMap(dialogue);

    // Use textToDialogue for multi-speaker synthesis
    const audio = await client.textToDialogue.convert({
      inputs: dialogue.map((line, idx) => ({
        text: line.text,
        voiceId: voiceMap.get(normalizeCharacter(line.character)) ?? DEFAULT_VOICE_ID,
      })),
    });

    // Normalize to Buffer regardless of SDK return type, then return as base64 data URL
    const audioBuffer = await toBuffer(audio as unknown);
    const base64 = audioBuffer.toString("base64");
    const dataUrl = `data:audio/mpeg;base64,${base64}`;

    let storedUrl: string | null = null;
    const supabase = getSupabaseAdminClient();
    if (supabase) {
      const filePath = `${sceneId}/${Date.now()}.mp3`;
      const { error: uploadError } = await supabase.storage
        .from(AUDIO_BUCKET)
        .upload(filePath, audioBuffer, {
          contentType: "audio/mpeg",
          upsert: true,
        });
      if (uploadError) {
        console.error("Supabase audio upload failed:", uploadError);
      } else {
        const { data } = supabase.storage.from(AUDIO_BUCKET).getPublicUrl(filePath);
        storedUrl = data?.publicUrl ?? null;
      }
    }

    const audioUrl = storedUrl ?? dataUrl;

    if (supabase) {
      const { error: persistError } = await supabase.from("audio_assets").insert({
        scene_id: sceneId,
        audio_url: audioUrl,
      });
      if (persistError) {
        console.error("Supabase insert audio failed:", persistError);
      }
    }

    return NextResponse.json({ audio_url: audioUrl });
  } catch (error) {
    console.error("Generate audio API error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to generate audio.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

