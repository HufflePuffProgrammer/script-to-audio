"use client";

import Link from "next/link";

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

export default function GenerateStep() {
  return (
    <main className="min-h-screen bg-[#f4f6fb]">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-10 lg:px-10">
        <header className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Step 4 of 4
          </p>
          <h1 className="text-2xl font-bold text-slate-900">Generate complete audio (demo)</h1>
          <p className="text-slate-600">
            Non-functional preview. Demonstrates the final action to render and download full audio.
          </p>
          <Progress activeIndex={3} />
        </header>

        <section className="space-y-3 rounded-3xl bg-white p-6 shadow-md ring-1 ring-slate-200">
          <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
            <p className="text-sm font-semibold text-slate-900">Full render</p>
            <p className="text-sm text-slate-600">
              Replace this call-to-action with a real `/api/generate-audio` integration that batches scenes and stores MP3s.
            </p>
          </div>
          <button
            type="button"
            className="rounded-full bg-[#f9cf00] px-4 py-2 text-sm font-semibold text-[#1b1b1b] shadow-md transition hover:brightness-95"
            disabled
          >
            Generate complete audio (disabled demo)
          </button>
          <p className="text-xs text-slate-500">
            Buttons and fields are illustrative only. Hook up Supabase storage and ElevenLabs when ready.
          </p>
        </section>

        <div className="flex justify-between">
          <Link
            href="/steps/audio"
            className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Back: Audio Staging
          </Link>
          <Link
            href="/"
            className="rounded-full bg-[#f9cf00] px-4 py-2 text-sm font-semibold text-[#1b1b1b] shadow-md transition hover:brightness-95"
          >
            Done / Back to landing
          </Link>
        </div>
      </div>
    </main>
  );
}

