import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { runParsePipeline } from "@/lib/parsePipeline";

/** Member-only parse — assigns owner_id. Not used by /demo. */
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: member } = await supabase
      .from("authorized_users")
      .select("user_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!member) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { text } = await request.json();
    if (!text || typeof text !== "string" || !text.trim()) {
      return NextResponse.json({ error: "No screenplay text provided." }, { status: 400 });
    }

    const result = await runParsePipeline(text, user.id);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Member parse API error:", error);
    return NextResponse.json({ error: "Failed to parse screenplay." }, { status: 500 });
  }
}
