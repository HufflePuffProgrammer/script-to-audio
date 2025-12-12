"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useScriptText } from "@/lib/useScriptText";
import { useParsedScenes, ParsedScenesCache } from "@/lib/useParsedScenes";
import { Scene } from "@/lib/types";

const steps = ["Paste Text", "Scenes", "Audio Staging", "Generate complete audio"];

const Progress = ({ activeIndex }: { activeIndex: number }) => {
  const progress = (activeIndex / (steps.length - 1)) * 100;
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-slate-500">
        {steps.map((label, idx) => (
          <span key={label} className={idx <= activeIndex ? "text-[#111827]" : "text-slate-400"}>
            {label}
          </span>
        ))}
      </div>
      <div className="relative h-2 overflow-hidden rounded-full bg-slate-200">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-[#f9cf00] transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

type ParseResponse = {
  scenes: Scene[];
  sceneCount: number;
};

export default function AudioStep() {
  const { text, hasText } = useScriptText();
  const { data: cached, setData: setCache, hasScenes: hasCachedScenes } = useParsedScenes();
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "ready">("idle");
  const [message, setMessage] = useState("Paste & parse first, then stage audio.");
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [audioUrls, setAudioUrls] = useState<Record<string, string>>({});
  const [audioStatus, setAudioStatus] = useState<Record<string, "idle" | "loading" | "ready" | "error">>({});

  const firstThreeScenes = useMemo(() => scenes.slice(0, 3), [scenes]);

  const parse = async () => {
    if (!hasText) {
      setMessage("No text found. Paste screenplay in Step 1 first.");
      return;
    }
    try {
      setStatus("loading");
      setMessage("Parsing screenplay...");
      const response = await fetch("/api/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!response.ok) throw new Error("Parse failed");
      const data: ParseResponse = await response.json();
      const payload: ParsedScenesCache = {
        scenes: data.scenes,
        sceneCount: data.sceneCount,
        characterFirstScene: {},
        audioUrls: {},
      };
      setScenes(data.scenes);
      setCache(payload);
      setStatus("ready");
      setMessage(`Parsed ${data.sceneCount} scene(s). Showing the first three below.`);
    } catch (error) {
      setStatus("error");
      setMessage("Failed to parse screenplay. Please try again.");
    }
  };

  useEffect(() => {
    if (hasCachedScenes && cached) {
      setScenes(cached.scenes);
      if (cached.audioUrls) setAudioUrls(cached.audioUrls);
      setStatus("ready");
      setMessage(`Loaded ${cached.sceneCount} scene(s) from cache.`);
      return;
    }
    if (hasText) {
      parse();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasText, hasCachedScenes, cached]);

  const generateAudio = async (scene: Scene) => {
    setAudioStatus((prev) => ({ ...prev, [scene.id]: "loading" }));
    try {
      const response = await fetch("/api/generate-audio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scene_id: scene.id, dialogue: scene.dialogue }),
      });
      if (!response.ok) throw new Error("Generate failed");
      const data: { audio_url: string } = await response.json();
      setAudioUrls((prev) => {
        const next = { ...prev, [scene.id]: data.audio_url };
        if (cached) {
          setCache({
            ...cached,
            audioUrls: { ...(cached.audioUrls || {}), [scene.id]: data.audio_url },
          });
        }
        return next;
      });
      setAudioStatus((prev) => ({ ...prev, [scene.id]: "ready" }));
    } catch (error) {
      setAudioStatus((prev) => ({ ...prev, [scene.id]: "error" }));
    }
  };

  return (
    <main className="min-h-screen bg-[#f4f6fb]">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-10 lg:px-10">
        <header className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Step 3 of 4
          </p>
          <h1 className="text-2xl font-bold text-slate-900">Audio Staging</h1>
          <p className="text-slate-600">
            Parses your pasted screenplay and lists the first three scenes with audio bar placeholders.
          </p>
          <Progress activeIndex={2} />
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <Link
              href="/steps/debug"
              className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1 font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              ElevenLabs debug page
            </Link>
            <span className="text-slate-500">
              Opens a sample call to /api/generate-audio with playback.
            </span>
            <Link
              href="/admin"
              className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1 font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Admin DB check
            </Link>
          </div>
        </header>

        <section className="space-y-3 rounded-3xl bg-white p-6 shadow-md ring-1 ring-slate-200">
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={parse}
              disabled={!hasText || status === "loading"}
              className="rounded-full bg-[#f9cf00] px-4 py-2 text-sm font-semibold text-[#1b1b1b] shadow-md transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {status === "loading" ? "Parsing..." : "Parse screenplay"}
            </button>
            <span className="text-sm text-slate-600">{message}</span>
          </div>
          {!hasText && (
            <p className="text-sm text-red-600">
              No screenplay text found. Go back to Paste step and add text.
            </p>
          )}
        </section>

        <section className="space-y-3 rounded-3xl bg-white p-6 shadow-md ring-1 ring-slate-200">
          {firstThreeScenes.length === 0 && (
            <p className="text-sm text-slate-500">No scenes parsed yet.</p>
          )}
          {firstThreeScenes.map((scene) => (
            <div
              key={scene.id}
              className="space-y-2 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-900">
                  Scene {scene.sceneNumber}
                </p>
                <span className="text-xs text-slate-500">{scene.heading}</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-white ring-1 ring-slate-200">
                <div className="h-full w-[45%] rounded-full bg-gradient-to-r from-indigo-500 to-purple-500" />
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => generateAudio(scene)}
                  disabled={audioStatus[scene.id] === "loading"}
                  className="rounded-full bg-[#f9cf00] px-3 py-1 text-xs font-semibold text-[#1b1b1b] shadow-sm transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {audioStatus[scene.id] === "loading" ? "Generating..." : "Generate audio"}
                </button>
                {audioStatus[scene.id] === "error" && (
                  <span className="text-xs text-red-600">Failed. Retry.</span>
                )}
              </div>
              {audioUrls[scene.id] && (
                <audio controls className="mt-2 w-full">
                  <source src={audioUrls[scene.id]} />
                </audio>
              )}
            </div>
          ))}
        </section>

        <div className="flex justify-between">
          <Link
            href="/steps/scenes"
            className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Back: Scenes
          </Link>
          <Link
            href="/steps/generate"
            className="rounded-full bg-[#f9cf00] px-4 py-2 text-sm font-semibold text-[#1b1b1b] shadow-md transition hover:brightness-95"
          >
            Next: Generate complete audio
          </Link>
        </div>
      </div>
    </main>
  );
}

