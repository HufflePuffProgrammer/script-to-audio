"use client";

import Link from "next/link";

import { useScriptText } from "@/lib/useScriptText";
import { FormEvent, useState, useEffect, useMemo } from "react";
import { CharacterVoiceIds, CharacterProfile } from "@/lib/types";
import { CHARACTER_BUILDER_RESULTS_KEY, PARSED_SCREENPLAY_RESULTS_KEY } from "@/lib/constants";
import { useAdminWorkflowClear } from "@/lib/useAdminWorkflowClear";
import { DialogueBoxScenesResults, CharacterBuilderResults, ParsedScreenplayResults, ResultsShape, LoadedResults, Section, SectionConfig, buildSections } from "@/lib/types";
const API_URL_CHARACTER_BUILDER = "/api/admin/character-builder";

  
 const dialogueBoxScenesSectionConfigs: SectionConfig<DialogueBoxScenesResults>[] = [
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
 const characterBuilderSectionConfigs: SectionConfig<CharacterBuilderResults> []=
 [
  { 
    title: "Profiles",
    selectItems: (results)=> results.profiles ?? []
  },
  {
    title: "Best Ranked Voices1",
    selectItems: (results)=> results.characterVoiceIds ?? []
  },
  {
    title: "Profile Prompts",
    selectItems: (results)=> results.profilePrompts ?? []
  },
 ]
 const parsedScreenplaySectionConfigs: SectionConfig<ParsedScreenplayResults> []
 =
 [
  {
    title: "Screenplay ID",
    selectItems: (results) =>
      results.screenplay_id ? [results.screenplay_id] : [],
  },
  {
    
    title: "Character First Scene",
    selectItems: (results)=> results.characterFirstScene 
    ? Object.entries(results.characterFirstScene).map(([character, sceneNumber])=> ({
      character,
      sceneNumber,
    }))
    : [],
  },
  {
    title: "Scene Count",
    selectItems: (results)=> results.sceneCount !== undefined ? [results.sceneCount] : [],
  },
  {
    title: "Scenes",
    selectItems: (results) => results.scenes ?? []
  }
 ];
 export default function BuildCharacter() {
 
  const { text, setText, clearCharacterBuilder, hasText, characters } = useScriptText();
  const [status, setStatus] = useState("");
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [results, setResults] = useState<ResultsShape | null>(null);
  const [loadedResults, setLoadedResults ] = useState<LoadedResults>(null);
  const [screenplayId, setScreenplayId] = useState<string | null>(null);
  
  useEffect(() => {
    const stored = window.localStorage.getItem(CHARACTER_BUILDER_RESULTS_KEY);
    if (stored) {
      setResults(JSON.parse(stored));
    }
  }, []);

  // Show the results panel for character-builder API data *or* loaded parsed screenplay / dialogue data.
  const hasResults = Boolean(results) || loadedResults != null;
  console.log("results:", results, "loadedResults:", loadedResults, "hasResults:", hasResults);

  const sections = useMemo(() => {
    if (loadedResults?.type === "characterBuilder") {
      return buildSections(
        loadedResults.results,
        characterBuilderSectionConfigs,
      );
    }
    if (loadedResults?.type === "parsedScreenplay") {
      return buildSections(
        loadedResults.results,
        parsedScreenplaySectionConfigs,
      );
    }
    if (loadedResults?.type === "dialogueBoxScenes") {
      return buildSections(
        loadedResults.results,
        dialogueBoxScenesSectionConfigs,
      );
    }
    return [];
  }, [loadedResults]);


  const handleLoadParsedScreenplay = () => {
    const stored = window.localStorage.getItem(PARSED_SCREENPLAY_RESULTS_KEY);
    console.log("handleLoadParsedScreenplay: stored:",stored);
    if (!stored) return;
    const parsed = JSON.parse(stored);
    const hasResults = Boolean(parsed);
    setLoadedResults({type: "parsedScreenplay", results: parsed});
    setScreenplayId( parsed.screenplay_id);
    setStatus("Loaded parsed screenplay complete.");

  }

  const handleClear = useAdminWorkflowClear({
    setText,
    setStatus,
    setUploadStatus,
    afterClear: () => {
      setResults(null);
      setLoadedResults(null);
      setScreenplayId(null);
    },
  });

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("Submitting...");
    console.log("screenplayId:",screenplayId);
    console.log("Text:", text);
    if (!screenplayId){
      setStatus("No screenplay ID found. Please load a parsed screenplay first.");
      return;
    }
      try {
      const response = await fetch(API_URL_CHARACTER_BUILDER, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          screenplayId,
        }),
      });

      if (!response.ok) {
        throw new Error("Request failed");
      }

      const data = await response.json();

      console.log("Server response:", data);
      window.localStorage.setItem(CHARACTER_BUILDER_RESULTS_KEY, JSON.stringify(data));
      setResults(data);
      setStatus("Built character profiles completed.");

      } catch (error) {
        console.error(error);
        setStatus("Error submitting form");
      }
      setStatus("Built character profiles complete.");
  };


  return (
    <main className="min-h-screen bg-[#f4f6fb]">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-10 lg:px-10">

        <header className="space-y-2">

          <h1 className="text-2xl font-bold text-slate-900">Admin: Build Character Profiles</h1>

        </header>

        <form className="space-y-4" onSubmit={handleSubmit}>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Link
                href="/admin"
                className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Back to Admin
              </Link>
              <button
                type="button"
                onClick={handleClear}
                className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Clear
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-2">
            <button
              className="rounded-full bg-[#f9cf00] px-4 py-2 text-sm font-semibold text-[#1b1b1b] shadow-md transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
              aria-disabled={!hasText}
              onClick={handleLoadParsedScreenplay}
              type="button"
              >
                1. Load Parsed Screenplay 
              </button>
              <button
                className="rounded-full bg-[#f9cf00] px-4 py-2 text-sm font-semibold text-[#1b1b1b] shadow-md transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
                aria-disabled={!hasText}
                tabIndex={hasText ? 0 : -1}
                type="submit"
              >
                2. Build Character
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
      </div>
    </main>
  );
}

