"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type ResultShape = {
  profiles?: any[];
  bestRankedVoices?: any[];
  profilePrompts?: string[];
};

export default function Step3CharProfile() {
  const [results, setResults] = useState<ResultShape | null>(null);

  useEffect(() => {
    const stored = window.sessionStorage.getItem("characterBuilderResults");
    if (stored) {
      setResults(JSON.parse(stored));
    }
  }, []);

  const hasResults = Boolean(results && (results.profiles || results.bestRankedVoices));

  const sections = useMemo(() => {
    if (!results) return [];
    return [
      {
        title: "Profiles",
        items: results.profiles ?? [],
      },
      {
        title: "Best Ranked Voices",
        items: results.bestRankedVoices ?? [],
      },
      {
        title: "Profile Prompts",
        items: results.profilePrompts ?? [],
      },
    ];
  }, [results]);

  return (
    <main className="min-h-screen bg-[#f4f6fb]">
      <div className="mx-auto max-w-5xl space-y-6 px-6 py-10 lg:px-10">
        <header className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Step 3 of 4
          </p>
          <h1 className="text-2xl font-bold text-slate-900">Character Profiles</h1>
          <p className="text-slate-600">
            Here are the prompts, profiles, and voice rankings returned from the server.
          </p>
        </header>

        {!hasResults && (
          <div className="rounded-3xl bg-white p-6 shadow-md ring-1 ring-slate-200">
            <p className="text-sm text-slate-500">
              No data available. Build a character first by pasting or uploading a script.
            </p>
            <Link
              href="/admin/character-builder"
              className="mt-4 inline-flex rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Back to Paste Step
            </Link>
          </div>
        )}

        {hasResults && (
          <div className="space-y-6">
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
            ))}
          </div>
        )}

        <div className="flex justify-between">
          <Link
            href="/admin"
            className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Back to Admin
          </Link>
          <div className="flex gap-2">
            <Link
              href="/admin/character-builder"
              className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Previous Step
            </Link>
            <Link
              href="/admin/character-builder/steps/step-4-voice"
              className="rounded-full bg-[#f9cf00] px-4 py-2 text-sm font-semibold text-[#1b1b1b] shadow-md transition hover:brightness-95"
            >
              Next: Voice Prompt
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
