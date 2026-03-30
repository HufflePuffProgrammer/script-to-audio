"use client";

import Link from "next/link";

import { useScriptText,PARSED_SCREENPLAY_RESULTS_KEY } from "@/lib/useScriptText";
import { ChangeEvent, FormEvent, useState,useEffect, useMemo } from "react";
import {
  buildNormalizedScriptText,
  mapPdfJsItems,
  normalizePdfLines,
} from "@/lib/normalizePdfLines";
const steps = ["Paste Script", "build LLM Char Input", "build Char Prompt ", "Generate complete audio"];

type ResultsShape = {
  characterFirstScene? : any;
  sceneCount? :number;
  scenes? : [{ id: string, sceneNumber: number, heading: string, dialogue: Array<{character: string, text: string, isNarration: boolean}>}]
} | null;

export default function ParseScreenplay() {

  const { text, setText, clear, hasText, characters } = useScriptText();
  const [status, setStatus] = useState("");
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [results, setResults] = useState<ResultsShape | null> (null);

  useEffect(() => {
    const stored = window.sessionStorage.getItem(PARSED_SCREENPLAY_RESULTS_KEY);
    if (stored) {
      setResults(JSON.parse(stored));
    }
  }, []);

  const hasResults = Boolean(results );
  console.log("results:",results, "has ressults", hasResults);
  const sections = useMemo(() => {
    if (!results) return [];
    const characterFirstSceneItems = results.characterFirstScene
      ? Object.entries(results.characterFirstScene).map(([character, sceneNumber]) => ({
          character,
          sceneNumber,
        }))
      : [];
    return [
      {
        title: "Character First Scene",
        items: characterFirstSceneItems,
      },
      {
        title: "Scene Count",
        items: results.sceneCount !== undefined ? [results.sceneCount] : [],
      },
      {
        title: "Scenes",
        items: results.scenes ?? []
      },
    ];
  }, [results]);

  const handleClear = () => {
    clear();
    setResults(null);
  };
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("Submitting...");
    console.log("Text:", text);
      try {
      const response = await fetch("/api/admin/parse-screenplay", {
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
      window.sessionStorage.setItem("PARSED_SCREENPLAY_RESULTS_KEY", JSON.stringify(data));
      setResults(data);
      setStatus("Parsed screenplay into dialogue boxes.");
      } catch (error) {
        console.error(error);
        setStatus("Error submitting form");
      }
  };

  const handlePdfUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    console.log("file:",file?.name);
    if (!file) return;
    if (file.type !== "application/pdf") {
      setUploadStatus("Only PDF uploads are supported right now.");
      return;
    }

    setIsExtracting(true);
    setUploadStatus("Extracting text from PDF...");
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfjs = await import("pdfjs-dist/legacy/build/pdf");
      pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
      const document = await pdfjs.getDocument({ data: arrayBuffer }).promise;
      let extractedText = "";
      let normalizedExtractedText = "";
     //console.log("document.numPages:",document.numPages);

      for (let pageIndex = 1; pageIndex <= document.numPages; pageIndex += 1) {
        const page = await document.getPage(pageIndex);
        const content = await page.getTextContent({ normalizeWhitespace: false, disableCombineTextItems: true });
        const positionedItems = mapPdfJsItems(
          content.items as Array<{ str?: string; transform?: number[] }>,
        );
        const normalizedLines = normalizePdfLines(positionedItems);
        const normalizedPageText = buildNormalizedScriptText(normalizedLines);
        const pageText = (() => {
          const buffer: string[] = [];
          let prevY: number | null = null;
          let atLineStart = true;
          const indentThreshold = 10;
          (content.items as Array<{ str?: string; transform?: number[] }>).forEach((item) => {
            if (!item.str) return;
            const y = item.transform?.[5];
            const x = item.transform?.[4];
            if (prevY !== null && y !== undefined && Math.abs(y - prevY) > 5) {
              buffer.push("\n");
              atLineStart = true;
            }
            if (atLineStart && x !== undefined && x > indentThreshold) {
              buffer.push("\t");
            }
            buffer.push(item.str);
            prevY = y ?? prevY;
            atLineStart = false;
          });
          return buffer.join("");
        })();
        console.log("normalizedLines:", pageIndex, normalizedLines);
        console.log("normalizedPageText:", pageIndex, JSON.stringify(normalizedPageText));
        console.log("pageText:", JSON.stringify(pageText));
        extractedText += `${pageText}\n`;
        normalizedExtractedText += `${normalizedPageText}\n`;
      }
      console.log("extractedText:",extractedText);
      console.log("normalizedExtractedText:", normalizedExtractedText);
      setText(normalizedExtractedText);
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
 
          <h1 className="text-2xl font-bold text-slate-900">Admin: Parse Screenplay into Dialogue Boxes</h1>
          

        </header>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <section className="space-y-3 rounded-3xl bg-white p-6 shadow-md ring-1 ring-slate-200">

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
                Parse Screenplay
              </button>
              
            </div>
          </div>
          {status && (
            <p className="text-sm font-medium text-slate-600">{status}</p>
          )}
          {uploadStatus && (
            <p className="text-sm text-slate-500">{uploadStatus}</p>
          )}
        </form>
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
                <h2 className="text-lg font-semibold text-slate-900">{section.title}:</h2>

                {section.items.length === 0 && (
                    <p className="text-slate-500">No entries.</p>
                  )}
         
             
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
      </div>
    </main>
  );
}

