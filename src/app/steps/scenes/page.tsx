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
  {
    number: 1,
    heading: "INT. KITCHEN - NIGHT",
    details: [
      "JOHN: Where were you?",
      "SARA: I told you already!",
      "NARRATOR: A clock ticks loudly.",
    ],
  },
  {
    number: 2,
    heading: "INT. LIVING ROOM - MORNING",
    details: [
      "NARRATOR: Sunlight creeps through the blinds.",
      "JOHN: Coffee?",
      "SARA: Please. Black.",
    ],
  },
  {
    number: 3,
    heading: "EXT. STREET - AFTERNOON",
    details: ["NARRATOR: Cars rush by.", "JOHN: We should hurry.", "SARA: Right behind you."],
  },
];

export default function ScenesStep() {
  return (
    <main className="min-h-screen bg-[#f4f6fb]">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-10 lg:px-10">
        <header className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Step 2 of 4
          </p>
          <h1 className="text-2xl font-bold text-slate-900">Scenes (demo)</h1>
          <p className="text-slate-600">
            Non-functional preview. Part A lists first three scenes. Part B shows details.
          </p>
          <Progress activeIndex={1} />
        </header>

        <section className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-3 rounded-3xl bg-white p-6 shadow-md ring-1 ring-slate-200">
            <p className="text-sm font-semibold text-slate-900">Part A — List</p>
            {demoScenes.map((scene) => (
              <div
                key={scene.number}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 shadow-inner"
              >
                <p className="font-semibold text-slate-900">Scene {scene.number}</p>
                <p className="text-slate-600">{scene.heading}</p>
              </div>
            ))}
          </div>

          <div className="space-y-3 rounded-3xl bg-white p-6 shadow-md ring-1 ring-slate-200">
            <p className="text-sm font-semibold text-slate-900">Part B — Details</p>
            {demoScenes.map((scene) => (
              <div
                key={`${scene.number}-detail`}
                className="space-y-2 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-900">
                    Scene {scene.number}
                  </p>
                  <span className="text-xs text-slate-500">{scene.heading}</span>
                </div>
                <div className="space-y-1 text-sm text-slate-700">
                  {scene.details.map((line, idx) => (
                    <div key={`${scene.number}-line-${idx}`} className="rounded-lg bg-white px-2 py-1">
                      {line}
                    </div>
                  ))}
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

