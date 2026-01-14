// test-claude.js
import { NextResponse } from "next/server";
const Anthropic = require("@anthropic-ai/sdk");

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

 async function test() {
  const res = await anthropic.messages.create({
    model: "claude-3-5-haiku-20241022",
    max_tokens: 10,
    messages: [{ role: "user", content: "Say hi" }]
  });

  console.log(res.content[0].text);
}

export async function GET() {
  const result = {
    supabase: { ok: true, error: null as string | null },
    elevenlabs: { ok: true, error: null as string | null },
  };
  try {
    const res = await test();
    result.supabase.ok = true;
    result.elevenlabs.ok = true;
  } catch (error) {
    result.supabase.ok = false;
    result.supabase.error = error instanceof Error ? error.message : "Unknown error";
  }
  return NextResponse.json(result, { status: 200 });
}

