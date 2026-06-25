"use client";

import Link from "next/link";
import { useScriptText } from "@/lib/useScriptTextDemo";
import { clearAdminWorkflowLocalStorage } from "@/lib/adminWorkflowStorage";
import { useParsedScenes } from "@/lib/useParsedScenes";
const STORAGE_KEY = "script-to-audio:parsedScenes";

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

export default function PasteStep() {
  const { text, setText,hasText, clear, clearParsedScreenplay, clearCharacterBuilder,  characters } = useScriptText();
  //const { clearParsedScenes } = useParsedScenes();
  const handleClear = () => {
    clear();
    console.log("clearAdminWorkflowLocalStorage");
    window.localStorage.removeItem(STORAGE_KEY);
    const saved =   window.localStorage.getItem(STORAGE_KEY);
    if (saved) {
      console.log("saved", saved);
    } else {
      console.log("no saved");
    } 
    clearParsedScreenplay();
    clearCharacterBuilder();
  }
  return (
    <main className="min-h-screen bg-[#f4f6fb]">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-10 lg:px-10">
        <header className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Step 1 of 5
          </p>
          <h1 className="text-2xl font-bold text-slate-900">Paste Text (demo)</h1>
          <p className="text-slate-600">
            Non-functional preview. Demonstration only.
          </p>
          <Progress activeIndex={0} /> 
        </header>

        <section className="space-y-3 rounded-3xl bg-white p-6 shadow-md ring-1 ring-slate-200">
          <textarea
          readOnly
            placeholder="Paste screenplay text..."
            className="min-h-[280px] w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 shadow-inner focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            value={text}
            onChange={(event) => setText(event.target.value)}
          />
          <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-slate-600">
            <div className="flex items-center gap-2">
              
            </div>
            <button
              type="button"
              onClick={handleClear}
              
              className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
            >
             Reset
            </button>
          </div>
        </section>

        <div className="flex justify-between">
          <Link
            href="/demo"
            className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
          >
            Back to landing
          </Link>
          <Link
            href="/demo/steps/2-parse-scenes"
            aria-disabled={!hasText}
            tabIndex={hasText ? 0 : -1}
            className={`rounded-full px-4 py-2 text-sm font-semibold shadow-md transition ${
              hasText
                ? "bg-[#f9cf00] text-[#1b1b1b] hover:brightness-95"
                : "pointer-events-none cursor-not-allowed border border-gray-500 border-slate-200 text-slate-700 opacity-60"
            }`}
          >
            Next: Scenes
          </Link>
        </div>
      </div>
    </main>
  );
}

