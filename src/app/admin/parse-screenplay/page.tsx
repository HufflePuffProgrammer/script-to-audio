"use client";

import Link from "next/link";

import { useScriptText } from "@/lib/useScriptText";
import { FormEvent, useState,useEffect, useMemo } from "react";
import { PARSED_SCREENPLAY_RESULTS_KEY } from "@/lib/constants";
import { DialogueBoxScenesResults, CharacterBuilderResults, ParsedScreenplayResults, ResultsShape, LoadedResults, Section ,SectionConfig, buildSections} from "@/lib/types";
import { useParseScreenplayActions } from "@/lib/useParseScreenplayActions";

const steps = ["Paste Script", "build LLM Char Input", "build Char Prompt ", "Generate complete audio"];
const API_URL_PARSE_SCREENPLAY = "/api/admin/parse-screenplay";

const dialogueBoxesScenesSectionConfigs: SectionConfig<DialogueBoxScenesResults>[] = [
  {
    title: "Scene IDs",
    selectItems: (scenes) => scenes.map((s) => s.scene_id),
  },
  {
    title: "Scene Numbers",
    selectItems: (scenes) => scenes.map((s) => s.sceneNumber),
  },
  {
    title: "Headings",
    selectItems: (scenes) => scenes.map((s) => s.heading),
  },
  {
    title: "Characters",
    selectItems: (scenes) => scenes.map((s) => s.characters),
  },
  {
    title: "Dialogue Boxes",
    selectItems: (scenes) => scenes.flatMap((s) => s.dialogue_boxes),
  },
];

const characterBuilderSectionConfigs: SectionConfig<CharacterBuilderResults>[] = [
  {
    title: "Profiles",
    selectItems: (results) => results.profiles ?? [],
  },
  {
    title: "Best Ranked Voices1",
    selectItems: (results) => results.characterVoiceIds ?? [],
  },
  {
    title: "Profile Prompts",
    selectItems: (results) => results.profilePrompts ?? [],
  },
];

const parsedScreenplaySectionConfigs: SectionConfig<ParsedScreenplayResults>[] = [
  {
    title: "Screenplay ID",
    selectItems: (results) => (results.screenplay_id ? [results.screenplay_id] : []),
  },
  {
    title: "Character First Scene",
    selectItems: (results) =>
      results.characterFirstScene
        ? Object.entries(results.characterFirstScene).map(([character, sceneNumber]) => ({
            character,
            sceneNumber,
          }))
        : [],
  },
  {
    title: "Scene Count",
    selectItems: (results) => (results.sceneCount !== undefined ? [results.sceneCount] : []),
  },
  {
    title: "Scenes",
    selectItems: (results) => results.scenes ?? [],
  },
];

export default function ParseScreenplay() {

  const { text, setText, clearParsedScreenplay, hasText, characters } = useScriptText();
  const [status, setStatus] = useState("");
  const [results, setResults] = useState<ResultsShape | null> (null);
  const [loadedResults, setLoadedResults ] = useState<LoadedResults>(null);
  const { isExtracting, uploadStatus, handleClear, handlePdfUpload } =
    useParseScreenplayActions({
      setText,
      setResults,
      setStatus,
    });
  
  const [screenplayId, setScreenplayId] = useState<string | null>(null);
  useEffect(() => {
    const stored = window.localStorage.getItem(PARSED_SCREENPLAY_RESULTS_KEY);
    if (!stored) return;
    const parsed = JSON.parse(stored);
    if (parsed) {
      setResults(parsed);
      setLoadedResults({type: "parsedScreenplay", results: parsed});
    }
    console.log("results from session storage",results);
  }, []);

  const hasResults = Boolean(results);
  console.log("results:",results, "has results", hasResults);
  const sections = useMemo(() => {
    if (loadedResults?.type === "characterBuilder") {
      return buildSections(
        loadedResults.results,
        characterBuilderSectionConfigs,
      );
    }
    if (loadedResults?.type === "parsedScreenplay") {
      console.log("loadedResults:",loadedResults);
      console.log("parsedScreenplaySectionConfigs:",parsedScreenplaySectionConfigs);
      return buildSections(
        loadedResults.results,
        parsedScreenplaySectionConfigs,
      );
    }
    if (loadedResults?.type === "dialogueBoxScenes") {
      return buildSections(
        loadedResults.results,
        dialogueBoxesScenesSectionConfigs,
      );
    }
    return [];
  }, [loadedResults]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("Submitting...");
    console.log("Text:", text);
    if (!text || text.trim().length === 0){
      setStatus("No text found. Please upload a PDF.");
      return;
    }
      try {
      const response = await fetch(API_URL_PARSE_SCREENPLAY, {
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
      window.localStorage.setItem(PARSED_SCREENPLAY_RESULTS_KEY, JSON.stringify(data));
      setResults(data);
      setScreenplayId(data.screenplay_id);
      setLoadedResults({type: "parsedScreenplay", results: data});
      setStatus("Parsed screenplay completed.");
      } catch (error) {
        console.error(error);
        setStatus("Error submitting form");
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
            <div className="flex flex-wrap items-center justify-between gap-2 mt-3 text-sm text-slate-600" >
              
              <button
                type="button"
                onClick={handleClear}
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
                1. Parse Screenplay
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

