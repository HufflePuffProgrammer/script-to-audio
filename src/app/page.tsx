"use client";

import Link from "next/link";
import { appName } from "@/lib/constants";

const cards = [
  {
    title: "Paste Text",
    href: "/steps/paste",
    description: "Drop screenplay text in a simple input.",
    icon: "📝",
  },
  {
    title: "Scenes",
    href: "/steps/scenes",
    description: "View the first three scenes and details.",
    icon: "🎬",
  },
  {
    title: "Audio Staging",
    href: "/steps/audio",
    description: "Stage multi-voice audio (demo only).",
    icon: "🎧",
  },
  {
    title: "Generate complete audio",
    href: "/steps/generate",
    description: "Full audio render preview (demo only).",
    icon: "🚀",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f4f6fb]">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-12 lg:px-12">
        <header className="space-y-6 text-center lg:text-left">
          
          <div className="space-y-4">
            <h1 className="text-4xl font-black leading-tight text-[#111827] sm:text-5xl">
              Every day has a story
            </h1>
            <p className="text-base text-slate-600 sm:text-lg">
              Listen to your screenplay with AI.
            </p>
          </div>
          
        </header>

        <div className="space-y-3">
          <p className="text-lg font-semibold text-[#111827]">Script-to-Audio</p>
          
        </div>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((card, index) => (
            <Link
              key={card.title}
              href={card.href}
              className="group relative overflow-hidden rounded-3xl bg-white p-6 text-left shadow-md ring-1 ring-slate-200 transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="absolute left-4 top-4 rounded-full bg-[#f9cf00] px-3 py-1 text-xs font-semibold text-[#1b1b1b] shadow-sm">
                Step {index + 1}
              </div>
              <div className="mt-6 flex h-24 w-full items-center justify-center rounded-2xl bg-slate-50 text-4xl">
                <span>{card.icon}</span>
              </div>
              <div className="mt-4 space-y-1">
                <p className="text-lg font-semibold text-slate-900">{card.title}</p>
                <p className="text-sm text-slate-600">{card.description}</p>
              </div>
            </Link>
          ))}
        </section>
      </div>
    </main>
  );
}
