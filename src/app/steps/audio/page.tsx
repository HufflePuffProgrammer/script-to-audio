"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useScriptText } from "@/lib/useScriptTextDemo";
import { useParsedScenes, ParsedScenesCache } from "@/lib/useParsedScenes";
import {
  CharacterBuilderResults,
  ParsedScreenplayResults,
  Scene,
} from "@/lib/types";
import {
  CHARACTER_BUILDER_RESULTS_KEY,
  PARSED_SCREENPLAY_RESULTS_KEY,
} from "@/lib/constants";

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

export default function AudioStep() {
  const { text, hasText } = useScriptText();
  const { data: cached, setData: setCache, hasScenes: hasCachedScenes } = useParsedScenes();
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "ready">("idle");
  const [message, setMessage] = useState("Generate audio.");
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [audioUrls, setAudioUrls] = useState<Record<string, string>>({});
  const [audioStatus, setAudioStatus] = useState<Record<string, "idle" | "loading" |"generating" | "ready" | "error">>({});
  const [generateAudioStatus, setGenerateAudioStatus] = useState<"idle" | "loading" | "generating" | "ready" | "error">("idle");
  const [characterProfiles, setCharacterProfiles] =
    useState<CharacterBuilderResults | null>(null);
  const [screenplayId, setScreenplayId] = useState<string>("");
  const [screenplayResults, setScreenplayResults] = useState<ParsedScreenplayResults | null>(null);
  const firstThreeScenes = useMemo(() => scenes.slice(0, 3), [scenes]);
  const API_URL = "/api/generate-audio";
  const parse = async () => {
    if (!hasText) {
      setMessage("No text found. Paste screenplay in Step 1 first.");
      return;
    }
    try {
      setStatus("loading");
      setMessage("Parsing screenplay...");
      setGenerateAudioStatus("loading");
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
      setGenerateAudioStatus("ready");
  
    } catch (error) {
      setStatus("error");
      setMessage("Failed to parse screenplay. Please try again.");
      setGenerateAudioStatus("error");
    }
  };

  useEffect(() => {
    const storedScreenplayResults = window.localStorage.getItem(PARSED_SCREENPLAY_RESULTS_KEY);
    if (!storedScreenplayResults) return;
    const parsedScreenplayResults = JSON.parse(storedScreenplayResults);

    setScreenplayResults(parsedScreenplayResults);
    setScreenplayId(parsedScreenplayResults.screenplay_id);

    const storedCharacterProfiles = window.localStorage.getItem(CHARACTER_BUILDER_RESULTS_KEY);
    if (!storedCharacterProfiles) return;
    const parsedCharacterProfiles = JSON.parse(storedCharacterProfiles);

    setCharacterProfiles(parsedCharacterProfiles);
    if (hasCachedScenes && cached) {
      setScenes(cached.scenes);
      setStatus("ready");
      setMessage(`Loaded ${cached.sceneCount} scene(s) from cache.`);
      if (cached.audioUrls && Object.keys(cached.audioUrls).length > 0) {
          console.log("cached.audioUrls.length:", Object.keys(cached.audioUrls).length);
          setAudioUrls(cached.audioUrls);
          setGenerateAudioStatus("ready");
          setMessage("Audio generated successfully. Staging the first three below.");
        }

      return;
    }
    if (hasText) {
      parse();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasText, hasCachedScenes, cached]);

  


  const generateAudio = async (scene: Scene) => {
    if (!characterProfiles || !screenplayResults) {
      setAudioStatus((prev) => ({ ...prev, [scene.id]: "error" }));
      return;
    }
    setMessage("Generating audio. This may take a few minutes...");
    setGenerateAudioStatus("loading");
    setAudioStatus((prev) => ({ ...prev, [scene.id]: "loading" }));
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ characterProfiles, screenplayResults }),
      });
      const data: { audio_urls?: string[]; error?: string } = await response.json();
      if (!response.ok || data.error) {
        throw new Error(data.error ?? "Generate failed");
      }

      const urls = data.audio_urls ?? [];
      const sceneList = screenplayResults.scenes ?? scenes;
      const urlBySceneId: Record<string, string> = {};
      sceneList.forEach((s, index) => {
        const url = urls[index];
        if (url) urlBySceneId[s.id] = url;
      });

      if (!urlBySceneId[scene.id]) {
        throw new Error("No audio URL returned for this scene");
      }
      setGenerateAudioStatus("ready");
      setMessage("Audio generated successfully. Staging the first three below.");

      setAudioUrls((prev) => ({ ...prev, ...urlBySceneId }));
      setAudioStatus((prev) => {
        const next = { ...prev };
        for (const id of Object.keys(urlBySceneId)) {
          next[id] = "ready";
        }
        return next;
      });
      if (cached) {
        setCache({
          ...cached,
          audioUrls: { ...(cached.audioUrls || {}), ...urlBySceneId },
        });
      }
    } catch (error) {
      console.error("Generate audio failed:", error);
      setAudioStatus((prev) => ({ ...prev, [scene.id]: "error" }));
    }
  };

  return (
    <main className="min-h-screen bg-[#f4f6fb]">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-10 lg:px-10">
        <header className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Step 4 of 5
          </p>
          <h1 className="text-2xl font-bold text-slate-900">Audio Staging</h1>
          <p className="text-slate-600">
            Stages the audio for each of the first three scenes.
          </p>
          <Progress activeIndex={3} />
        </header>

        <section className="space-y-3 rounded-3xl bg-white p-6 shadow-md ring-1 ring-slate-200">
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
                onClick={() => generateAudio(firstThreeScenes[0])}
                disabled={generateAudioStatus === "loading" || generateAudioStatus === "ready"}
                className="rounded-full bg-[#f9cf00] px-4 py-2 text-sm font-semibold text-[#1b1b1b] shadow-md transition hover:brightness-95"

           >
              {generateAudioStatus === "loading" ? "Generating..." : generateAudioStatus === "ready" ? "Generated" : "Generate audio"}
            </button>
           <span className="text-sm text-slate-600">{message}: {generateAudioStatus}</span>
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
            href="/steps/character-builder"
            className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Back: Character Builder
          </Link>
          {generateAudioStatus === "ready" ? (
            <Link
              href="/steps/generate"
              className="rounded-full bg-[#f9cf00] px-4 py-2 text-sm font-semibold text-[#1b1b1b] shadow-md transition hover:brightness-95"
            >
              Next: Generate Complete Audio {generateAudioStatus}
            </Link>
          ) : (
            <button
              type="button"
              disabled
              className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 shadow-md transition disabled:cursor-not-allowed disabled:opacity-60"
            >
              Next: Generate Complete Audio {generateAudioStatus}
            </button>
          )}
        </div>
      </div>
    </main>
  );
}

