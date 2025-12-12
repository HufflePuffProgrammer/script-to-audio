"use client";

import { useState } from "react";

type Status = "idle" | "loading" | "success" | "error";

const samplePayload = {
  scene_id: "debug-scene-1",
  dialogue: [
    { character: "DEBUG_A", text: "Hello from the debug page." },
    { character: "DEBUG_B", text: "Replying from the other side." },
  ],
};

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
        body: JSON.stringify(samplePayload),
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
          <h1 className="text-3xl font-bold">ElevenLabs API check</h1>
          <p className="text-sm text-gray-600">
            Calls <code>/api/generate-audio</code> with a sample dialogue and
            surfaces the returned <code>audio_url</code>. Ensure{" "}
            <code>ELEVENLABS_API_KEY</code> is set in <code>.env.local</code>{" "}
            and the dev server is running.
          </p>
        </header>

        <section className="rounded-lg border border-gray-200 p-4 space-y-3">
          <div>
            <div className="text-sm font-semibold text-gray-800">
              Sample payload
            </div>
            <pre className="mt-1 rounded bg-gray-50 p-3 text-xs text-gray-800">
              {JSON.stringify(samplePayload, null, 2)}
            </pre>
          </div>

          <button
            type="button"
            onClick={runDebug}
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-60"
            disabled={status === "loading"}
          >
            {status === "loading" ? "Running..." : "Run ElevenLabs debug"}
          </button>

          {message && (
            <div
              className={`rounded-md border px-3 py-2 text-sm ${
                status === "error"
                  ? "border-red-200 bg-red-50 text-red-700"
                  : "border-green-200 bg-green-50 text-green-700"
              }`}
            >
              {message}
            </div>
          )}

          {audioUrl && (
            <div className="space-y-2">
              <div className="text-sm font-semibold text-gray-800">
                Playback
              </div>
              <audio controls src={audioUrl} className="w-full">
                Your browser does not support the audio element.
              </audio>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

