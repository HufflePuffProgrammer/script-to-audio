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

export default function ScenesStep() {
  const { text, hasText } = useScriptText();
  const { data: cached, setData: setCache, hasScenes: hasCachedScenes } = useParsedScenes();
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "ready">("idle");
  const [message, setMessage] = useState("Paste text in Step 1, then parse.");
  const [scenes, setScenes] = useState<Scene[]>([]);

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
      setScenes(data.scenes);
      setCache({
        scenes: data.scenes,
        sceneCount: data.sceneCount,
        characterFirstScene: {},
        audioUrls: cached?.audioUrls || {},
      });
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
      setStatus("ready");
      setMessage(`Loaded ${cached.sceneCount} scene(s) from cache.`);
      return;
    }
    if (hasText) {
      parse();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasText, hasCachedScenes, cached]);

  return (
    <main className="min-h-screen bg-[#f4f6fb]">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-10 lg:px-10">
        <header className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Step 2 of 4
          </p>
          <h1 className="text-2xl font-bold text-slate-900">Scenes</h1>
          <p className="text-slate-600">
            Parses your pasted screenplay (mock server parse) and shows the first three scenes.
          </p>
          <Progress activeIndex={1} />
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

        <section className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-3 rounded-3xl bg-white p-6 shadow-md ring-1 ring-slate-200">
            <p className="text-sm font-semibold text-slate-900">Part A — List</p>
            <p className="text-sm font-semibold text-slate-900">Number of Scenes: {firstThreeScenes.length}</p>
            <p className="text-sm font-semibold text-slate-900">Number of Characters: {firstThreeScenes.reduce((acc, scene) => acc + scene.characters.length, 0)}</p>
            <p className="text-sm font-semibold text-slate-900">List of Characters: {firstThreeScenes.flatMap((scene) => scene.characters).join(", ")}</p>
            {firstThreeScenes.length === 0 && (
              <p className="text-sm text-slate-500">No scenes parsed yet.</p>
            )}
            {firstThreeScenes.map((scene) => (
              <div
                key={scene.id}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 shadow-inner"
              >
                <p className="font-semibold text-slate-900">Scene {scene.sceneNumber}</p>
                <p className="text-slate-600">{scene.heading}</p>
              </div>
            ))}
          </div>

          <div className="space-y-3 rounded-3xl bg-white p-6 shadow-md ring-1 ring-slate-200">
            <p className="text-sm font-semibold text-slate-900">Part B — Details</p>
            {firstThreeScenes.length === 0 && (
              <p className="text-sm text-slate-500">No details yet.</p>
            )}
            {firstThreeScenes.map((scene) => (
              <div
                key={`${scene.id}-detail`}
                className="space-y-2 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-900">
                    Scene {scene.sceneNumber}
                  </p>
                  <span className="text-xs text-slate-500">{scene.heading}</span>
                </div>
                <div className="space-y-1 text-sm text-slate-700">
                  {scene.dialogue.slice(0, 3).map((line, idx) => (
                    <div key={`${scene.id}-line-${idx}`} className="rounded-lg bg-white px-2 py-1">
                      <span className="font-semibold">{line.character}: </span>
                      <span>{line.text}</span>
                    </div>
                  ))}
                  {scene.dialogue.length > 3 && (
                    <p className="text-xs text-slate-500">…more lines</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="flex justify-between">
          <Link
            href="/steps/paste"
            className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Back: Paste Text
          </Link>
          <Link
            href="/steps/audio"
            className="rounded-full bg-[#f9cf00] px-4 py-2 text-sm font-semibold text-[#1b1b1b] shadow-md transition hover:brightness-95"
          >
            Next: Audio Staging
          </Link>
        </div>
      </div>
    </main>
  );
}

