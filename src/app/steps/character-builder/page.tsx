"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useScriptText } from "@/lib/useScriptText";
import { useParsedScenes, ParsedScenesCache } from "@/lib/useParsedScenes";
import { Scene } from "@/lib/types";
import { PARSED_SCREENPLAY_RESULTS_KEY } from "@/lib/constants";

const steps = ["Paste Text", "Scenes", "Character Builder", "Audio Staging", "Generate complete audio"];

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


export default function CharacterBuilderStep() {
  const { text, hasText } = useScriptText();
  const { data: cached, setData: setCache, hasScenes: hasCachedScenes } = useParsedScenes();
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "ready">("idle");
  const [message, setMessage] = useState("Paste text in Step 1, then parse.");
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [ characterVoiceIds, setCharacterVoiceIds] = useState<any[]>([]);
  const API_URL = "/api/character-builder";
  const [screenplayId, setScreenplayId] = useState<string | null>(null);
  useEffect(() => {
    const stored = window.localStorage.getItem(PARSED_SCREENPLAY_RESULTS_KEY);
    if (!stored) return;
    const parsed = JSON.parse(stored);
    setScreenplayId(parsed);
    console.log("results from session storage",parsed);
  }, []);

  const buildCharacters = async () => {

    try {
      setStatus("loading");
      setMessage("Parsing screenplay...");
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ screenplayId }),
      });
      if (!response.ok) throw new Error("Parse failed");
      const data: ParseResponse = await response.json();
      console.log("data: ", data);
      setCharacterVoiceIds(data.characterVoiceIds);
      console.log("characterVoiceIds: ", characterVoiceIds);
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

  // useEffect(() => {
  //   if (hasCachedScenes && cached) {
  //     setScenes(cached.scenes);
  //     setStatus("ready");
  //     setMessage(`Loaded ${cached.sceneCount} scene(s) from cache.`);
  //     return;
  //   }
  //   if (hasText) {
  //     buildCharacters();
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [hasText, hasCachedScenes, cached]);

  return (
    <main className="min-h-screen bg-[#f4f6fb]">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-10 lg:px-10">
        <header className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Step 3 of 5
          </p>
          <h1 className="text-2xl font-bold text-slate-900">Scenes</h1>
          <p className="text-slate-600">
            Character Builder
          </p>
          <Progress activeIndex={2} />
        </header>
        <section className="space-y-3 rounded-3xl bg-white p-6 shadow-md ring-1 ring-slate-200">
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={buildCharacters}
              disabled={!hasText || status === "loading"}
              className="rounded-full bg-[#f9cf00] px-4 py-2 text-sm font-semibold text-[#1b1b1b] shadow-md transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {status === "loading" ? "Building..." : "Build Characters"}
            </button>
            <span className="text-sm text-slate-600">{message}</span>
          </div>

        </section>
{/* 
        {sections.map((section) => (
              <section key={section.title} className="rounded-3xl bg-white p-6 shadow-md ring-1 ring-slate-200">
                <h2 className="text-lg font-semibold text-slate-900">{section.title}</h2>
                <div className="mt-4 space-y-3 text-sm text-slate-700">
                  {section.items.length === 0 && (
                    <p className="text-slate-500">No entries.</p>
                  )}
                  {section.items.map((item, index) => (
                    <pre
                      key={index}
                      className="overflow-x-auto rounded-2xl bg-slate-50 p-3 text-xs text-slate-800"
                    >
                      {typeof item === "string" ? item : JSON.stringify(item, null, 2)}
                    </pre>
                  ))}
                </div>
              </section>
            ))} */}

        <div className="flex justify-between">
          <Link
            href="/steps/scenes"
            className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Back: Scenes
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

