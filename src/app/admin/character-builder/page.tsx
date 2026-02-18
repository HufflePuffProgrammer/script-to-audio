"use client";

import Link from "next/link";
import { useScriptText } from "@/lib/useScriptText";
import { ChangeEvent, FormEvent, useState } from "react";

const steps = ["Paste Script", "build LLM Char Input", "build Char Prompt ", "Generate complete audio"];


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
  const { text, setText, clear, hasText, characters } = useScriptText();
  const [status, setStatus] = useState("");
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("Submitting...");
    console.log("Text:", text);
      try {
        const response = await fetch("/api/admin/character-builder", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text,
          }),
        });

        if (!response.ok) {
          throw new Error("Request failed");
        }

        const data = await response.json();

        console.log("Server response:", data);

        setStatus("Saved!");
        setText(""); // clear form
      } catch (error) {
        console.error(error);
        setStatus("Error submitting form");
      }
  };

  const handlePdfUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") {
      setUploadStatus("Only PDF uploads are supported right now.");
      return;
    }

    setIsExtracting(true);
    setUploadStatus("Extracting text from PDF...");
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfjs = await import("pdfjs-dist");
      pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
      const document = await pdfjs.getDocument({ data: arrayBuffer }).promise;
      let extractedText = "";
      for (let pageIndex = 1; pageIndex <= document.numPages; pageIndex += 1) {
        const page = await document.getPage(pageIndex);
        const content = await page.getTextContent();
        const pageText = (content.items as { str?: string }[])
          .map((item) => item.str ?? "")
          .join(" ");
        extractedText += `${pageText}\n`;
      }
      setText(extractedText.trim());
      setUploadStatus("PDF text extracted successfully.");
    } catch (error) {
      console.error("Failed to parse PDF", error);
      setUploadStatus("Could not extract text from this PDF.");
    } finally {
      setIsExtracting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f4f6fb]">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-10 lg:px-10">

        <header className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Step 1 of 4
          </p>
          <h1 className="text-2xl font-bold text-slate-900">Paste Text (demo)</h1>
          <p className="text-slate-600">
            Paste screenplay text in the box.
          </p>
          <Progress activeIndex={0} />
        </header>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <section className="space-y-3 rounded-3xl bg-white p-6 shadow-md ring-1 ring-slate-200">
            <textarea
              name="text"
              placeholder="Paste screenplay text..."
              className="min-h-[280px] w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 shadow-inner focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              value={text}
              onChange={(event) => setText(event.target.value)}
            />
            <label className="text-sm font-semibold text-slate-600">
              Or upload a PDF (auto-extracts text):
              <input
                type="file"
                accept="application/pdf"
                disabled={isExtracting}
                onChange={handlePdfUpload}
                className="mt-2 block w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 shadow-inner transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              />
            </label>
            <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-2 rounded-full bg-[#f9cf00]/80 px-3 py-1 text-xs font-semibold text-[#1b1b1b] shadow-sm">
                  Saved locally
                </span>
                <span>{characters} characters</span>
              </div>
              <button
                type="button"
                onClick={clear}
                className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Clear
              </button>
            </div>
          </section>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Link
              href="/admin"
              className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Back to Admin
            </Link>
            <div className="flex flex-wrap items-center gap-2">
              <button
                className="rounded-full bg-[#f9cf00] px-4 py-2 text-sm font-semibold text-[#1b1b1b] shadow-md transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
                aria-disabled={!hasText}
                tabIndex={hasText ? 0 : -1}
                type="submit"
              >
                Build Character
              </button>
              <Link
                href="/admin/steps/build-character-input"
                className="rounded-full bg-[#f9cf00] px-4 py-2 text-sm font-semibold text-[#1b1b1b] shadow-md transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
                aria-disabled={!hasText}
                tabIndex={hasText ? 0 : -1}
              >
                Next: Build Character input
              </Link>
            </div>
          </div>
          {status && (
            <p className="text-sm font-medium text-slate-600">{status}</p>
          )}
          {uploadStatus && (
            <p className="text-sm text-slate-500">{uploadStatus}</p>
          )}
        </form>

      </div>
    </main>
  );
}

