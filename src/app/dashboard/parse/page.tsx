"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DashboardParsePage() {
  const router = useRouter();
  const [text, setText] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [message, setMessage] = useState("");

  const parse = async () => {
    if (!text.trim()) {
      setMessage("Paste screenplay text first.");
      setStatus("error");
      return;
    }

    try {
      setStatus("loading");
      setMessage("Parsing…");

      const response = await fetch("/api/member/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      const body = await response.json();

      if (!response.ok) {
        throw new Error(body?.error || "Parse failed");
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Parse failed");
    }
  };

  return (
    <main className="min-h-screen bg-[#f4f6fb] px-6 py-10">
      <div className="mx-auto flex max-w-3xl flex-col gap-6">
        <header className="space-y-2">
          <Link
            href="/dashboard"
            className="text-sm font-semibold text-blue-600 hover:text-blue-700"
          >
            ← Back to dashboard
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">Parse screenplay</h1>
          <p className="text-sm text-slate-600">
            Adds a screenplay to your account. The public demo at{" "}
            <Link href="/demo" className="font-semibold text-blue-600 hover:text-blue-700">
              /demo
            </Link>{" "}
            is unchanged and does not attach screenplays to your account.
          </p>
        </header>

        <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <textarea
            placeholder="Paste screenplay text…"
            className="min-h-[280px] w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100"
            value={text}
            onChange={(event) => setText(event.target.value)}
          />

          {status === "error" && message && (
            <p className="text-sm text-red-600">{message}</p>
          )}

          <button
            type="button"
            onClick={() => void parse()}
            disabled={status === "loading"}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {status === "loading" ? "Parsing…" : "Parse and save"}
          </button>
        </section>
      </div>
    </main>
  );
}
