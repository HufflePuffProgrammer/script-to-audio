import { NextResponse } from "next/server";

import { runParsePipeline } from "@/lib/parsePipeline";

/** Public parse API — used by /demo. Never assigns screenplay ownership. */
export async function POST(request: Request) {
  try {
    const { text } = await request.json();
    if (!text || typeof text !== "string" || !text.trim()) {
      return NextResponse.json({ error: "No screenplay text provided." }, { status: 400 });
    }

    const result = await runParsePipeline(text);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Parse API error:", error);
    return NextResponse.json({ error: "Failed to parse screenplay." }, { status: 500 });
  }
}
