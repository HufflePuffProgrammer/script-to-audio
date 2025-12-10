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

export default function PasteStep() {
  return (
    <main className="min-h-screen bg-[#f4f6fb]">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-10 lg:px-10">
        <header className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Step 1 of 4
          </p>
          <h1 className="text-2xl font-bold text-slate-900">Paste Text (demo)</h1>
          <p className="text-slate-600">
            Non-functional preview. Drop screenplay text in the box as a demonstration only.
          </p>
          <Progress activeIndex={0} />
        </header>

        <section className="rounded-3xl bg-white p-6 shadow-md ring-1 ring-slate-200">
          <textarea
            placeholder="Paste screenplay text (demo only)..."
            className="min-h-[280px] w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 shadow-inner focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            readOnly
            defaultValue="INT. KITCHEN - NIGHT\n\nJOHN\nWhere were you?\n\nSARA\nI told you already!"
          />
          <p className="mt-3 text-sm text-slate-500">
            This page is static for design reference. Wire real parsing later.
          </p>
        </section>

        <div className="flex justify-between">
          <Link
            href="/"
            className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Back to landing
          </Link>
          <Link
            href="/steps/scenes"
            className="rounded-full bg-[#f9cf00] px-4 py-2 text-sm font-semibold text-[#1b1b1b] shadow-md transition hover:brightness-95"
          >
            Next: Scenes
          </Link>
        </div>
      </div>
    </main>
  );
}

