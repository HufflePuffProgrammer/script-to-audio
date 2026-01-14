"use client";

import { useState } from "react";
import Link from "next/link";
type Status = "idle" | "loading" | "success" | "error";

;

export default function DebugElevenLabsPage() {
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string>("");
  const [audioUrl, setAudioUrl] = useState<string>("");

  const runDebug = async () => {
    setStatus("loading");
    setMessage("");
    setAudioUrl("");

    try {
      const res = await fetch("/api/generate-audio", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          scene_id: "1",
          dialogue: [
            { character: "MARA", text: "Hello, how are you?" },
            { character: "DAVID", text: "I'm good, thank you." },
          ],
        }),
      });

      const body = await res.json();
      if (!res.ok) {
        throw new Error(body?.error || `Request failed with ${res.status}`);
      }
      if (!body?.audio_url || typeof body.audio_url !== "string") {
        throw new Error("Missing audio_url in response");
      }

      setAudioUrl(body.audio_url);
      setStatus("success");
      setMessage("Audio generated successfully. Press play below.");
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Unknown error");
    }
  };

  return (
    <main className="min-h-screen bg-white text-gray-900 px-6 py-10">
      <div className="max-w-3xl mx-auto space-y-6">
        <header className="space-y-2">
          <p className="text-sm font-semibold text-blue-600 uppercase">
            Debug
          </p>
          <h1 className="text-3xl font-bold">Character Builder</h1>
          <p className="text-sm text-gray-600">
            Calls <code>/api/build-character</code> with a sample dialogue and
            surfaces the returned <code>audio_url</code>
            
          </p>
        </header>

        <section className="rounded-lg border border-gray-200 p-4 space-y-3">
          <div>
            <div className="text-sm font-semibold text-gray-800">
              Sample payload
            </div>

          </div>

          <Link
                href="/api/admin/character-builder"
                className="inline-flex items-center gap-2 rounded-md border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Go to character builder
              </Link>
        </section>
        <section className="rounded-lg border border-gray-200 p-4 space-y-3">
          <div>
            <div className="text-sm font-semibold text-gray-800">
              Sample payload
            </div>

          </div>

          <Link
                href="/api/admin/test"
                className="inline-flex items-center gap-2 rounded-md border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                test
              </Link>
        </section>
      </div>
    </main>
  );
}

