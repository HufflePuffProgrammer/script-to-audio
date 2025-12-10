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

const demoScenes = [
  { number: 1, heading: "INT. KITCHEN - NIGHT" },
  { number: 2, heading: "INT. LIVING ROOM - MORNING" },
  { number: 3, heading: "EXT. STREET - AFTERNOON" },
];

export default function AudioStep() {
  return (
    <main className="min-h-screen bg-[#f4f6fb]">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-10 lg:px-10">
        <header className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Step 3 of 4
          </p>
          <h1 className="text-2xl font-bold text-slate-900">Audio Staging (demo)</h1>
          <p className="text-slate-600">
            Non-functional preview. Lists first three scenes with an audio bar placeholder under each.
          </p>
          <Progress activeIndex={2} />
        </header>

        <section className="space-y-3 rounded-3xl bg-white p-6 shadow-md ring-1 ring-slate-200">
          {demoScenes.map((scene) => (
            <div
              key={scene.number}
              className="space-y-2 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-900">Scene {scene.number}</p>
                <span className="text-xs text-slate-500">{scene.heading}</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-white ring-1 ring-slate-200">
                <div className="h-full w-[45%] rounded-full bg-gradient-to-r from-indigo-500 to-purple-500" />
              </div>
              <p className="text-xs text-slate-500">Audio bar placeholder — design only.</p>
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

