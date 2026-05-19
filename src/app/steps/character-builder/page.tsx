"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useScriptText } from "@/lib/useScriptText";
import { CharacterBuilderResults, CharacterVoiceIds, VoiceLabels } from "@/lib/types";
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

function VoiceLabelsDisplay({ labels }: { labels: VoiceLabels | undefined }) {
  if (!labels) {
    return <span className="text-slate-500">—</span>;
  }
  if (typeof labels === "string") {
    return <span>{labels}</span>;
  }
  const entries = Object.entries(labels).filter(
    (entry): entry is [string, string] =>
      typeof entry[1] === "string" && entry[1].trim() !== "",
  );
  if (entries.length === 0) {
    return <span className="text-slate-500">—</span>;
  }
  return (
    <div className="flex flex-wrap gap-1.5">
      {entries.map(([key, value]) => (
        <span
          key={key}
          className="rounded-full bg-white px-2.5 py-0.5 text-xs text-slate-800 ring-1 ring-slate-200"
        >
          <span className="font-medium capitalize">{key.replace(/_/g, " ")}</span>
          {": "}
          {value}
        </span>
      ))}
    </div>
  );
}

function CharacterVoiceCard({ assignment }: { assignment: CharacterVoiceIds }) {
  return (
    <article className="space-y-3 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
      <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-slate-200 pb-3">
        <h3 className="text-base font-semibold text-slate-900">{assignment.character_name}</h3>
        <span className="rounded-full bg-[#f9cf00]/30 px-2.5 py-0.5 text-xs font-semibold text-[#1b1b1b]">
          Voice assigned
        </span>
      </div>
      <dl className="grid gap-2 text-sm sm:grid-cols-[7rem_1fr]">
        <dt className="font-medium text-slate-500">Voice ID</dt>
        <dd className="break-all font-mono text-xs text-slate-800">{assignment.voice_id}</dd>
        <dt className="font-medium text-slate-500">Description</dt>
        <dd className="text-slate-800">{assignment.description || "—"}</dd>
        <dt className="font-medium text-slate-500">Labels</dt>
        <dd>
          <VoiceLabelsDisplay labels={assignment.labels} />
        </dd>
        <dt className="font-medium text-slate-500">Reason</dt>
        <dd className="text-slate-700">{assignment.reason || "—"}</dd>
      </dl>
    </article>
  );
}

export default function CharacterBuilderStep() {
  const { hasText } = useScriptText();
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "ready">("idle");
  const [message, setMessage] = useState("Paste text in Step 1, then parse.");
  const [characterVoiceIds, setCharacterVoiceIds] = useState<CharacterVoiceIds[]>([]);
  const API_URL = "/api/character-builder";
  const [screenplayId, setScreenplayId] = useState<string | null>(null);

  useEffect(() => {
    const stored = window.localStorage.getItem(PARSED_SCREENPLAY_RESULTS_KEY);
    if (!stored) return;
    setScreenplayId(JSON.parse(stored));

    const storedCharacterBuilder = window.localStorage.getItem(CHARACTER_BUILDER_RESULTS_KEY);
    if (!storedCharacterBuilder) return;
    const parsedCharacterBuilder = JSON.parse(storedCharacterBuilder);
    setCharacterVoiceIds(parsedCharacterBuilder.characterVoiceIds ?? []);
  }, []);

  const buildCharacters = async () => {
    try {
      setStatus("loading");
      setMessage("Building character voices...");
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ screenplayId }),
      });
      if (!response.ok) throw new Error("Parse failed");
      const data: CharacterBuilderResults = await response.json();
      setCharacterVoiceIds(data.characterVoiceIds ?? []);
      window.localStorage.setItem(CHARACTER_BUILDER_RESULTS_KEY, JSON.stringify(data));
      setStatus("ready");
      setMessage(
        `Built ${data.characterVoiceIds?.length ?? 0} character voice assignment(s).`,
      );
    } catch {
      setStatus("error");
      setMessage("Failed to build characters. Please try again.");
    }
  };

  return (
    <main className="min-h-screen bg-[#f4f6fb]">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-10 lg:px-10">
        <header className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Step 3 of 5
          </p>
          <h1 className="text-2xl font-bold text-slate-900">Character Builder</h1>
          <p className="text-slate-600">
            Assign a voice to each character before audio staging.
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

        {characterVoiceIds.length > 0 && (
          <section className="rounded-3xl bg-white p-6 shadow-md ring-1 ring-slate-200">
            <div className="flex items-baseline justify-between gap-2">
              <h2 className="text-lg font-semibold text-slate-900">Character voices</h2>
              <p className="text-sm text-slate-500">
                {characterVoiceIds.length} character{characterVoiceIds.length === 1 ? "" : "s"}
              </p>
            </div>
            <div className="mt-4 space-y-4">
              {characterVoiceIds.map((assignment) => (
                <CharacterVoiceCard
                  key={`${assignment.character_name}-${assignment.voice_id}`}
                  assignment={assignment}
                />
              ))}
            </div>
          </section>
        )}

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
