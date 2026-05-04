"use client";

import Link from "next/link";

import { useScriptText } from "@/lib/useScriptText";
import { ChangeEvent, FormEvent, useState,  useMemo } from "react";
import {DialogueBoxScene, DialogueBox} from "@/lib/types";
import { CHARACTER_BUILDER_RESULTS_KEY, PARSED_SCREENPLAY_RESULTS_KEY, DIALOGUE_BOXES_SCENES_KEY, DIALOGUE_BOXES_AUDIO_KEY, COMPLETE_AUDIO_KEY } from "@/lib/constants";
import { DialogueBoxScenesResults, CharacterBuilderResults, ParsedScreenplayResults, ResultsShape, LoadedResults, Section ,SectionConfig, buildSections} from "@/lib/types";

const API_URL = "/api/admin/build-dialogue-box";


  
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

const characterBuilderSectionConfigs: SectionConfig<CharacterBuilderResults>[] = [
  {
    title: "Profiles",
    selectItems: (results) => results.profiles ?? [],
  },
  {
    title: "Best Ranked Voices",
    selectItems: (results) => results.characterVoiceIds ?? [],
  },
  {
    title: "Profile Prompts",
    selectItems: (results) => results.profilePrompts ?? [],
  },
];

const parsedScreenplaySectionConfigs: SectionConfig<ParsedScreenplayResults>[] = [
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
    selectItems: (results) =>
      results.sceneCount !== undefined ? [results.sceneCount] : [],
  },
  {
    title: "Scenes",
    selectItems: (results) => results.scenes ?? [],
  },
];

export default function BuildDialogueBox() {
 
  const { text, setText, hasText } = useScriptText();
  const [status, setStatus] = useState("");
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [CPResults, setCPResults] = useState<CharacterBuilderResults | null>(null);
  const [PSResults, setPSResults] = useState<ParsedScreenplayResults | null>(null);
  const [results, setResults] = useState<ResultsShape | null>(null);
  const [loadedResults, setLoadedResults ] = useState<LoadedResults>(null);
  const [screenplayId, setScreenplayId] = useState<string | null>(null);
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


const handleLoadCharacterProfiles = () => {
   const stored = window.localStorage.getItem(CHARACTER_BUILDER_RESULTS_KEY);
   if (!stored) return;
  const parsed = JSON.parse(stored);
  setLoadedResults({type: "characterBuilder", results: parsed});
  setCPResults(parsed);
  setStatus("Loaded character profiles complete.");
}
const handleLoadParsedScreenplay = () =>{
  const stored = window.localStorage.getItem(PARSED_SCREENPLAY_RESULTS_KEY);
  if (!stored) return;
  const parsed = JSON.parse(stored);
  setLoadedResults({type: "parsedScreenplay", results: parsed});
  setScreenplayId(parsed.screenplay_id);
  setPSResults(parsed);
  setStatus("Loaded parsed screenplay complete.");
}
const handleClear = () => {
  window.localStorage.removeItem(PARSED_SCREENPLAY_RESULTS_KEY);
  window.localStorage.removeItem(CHARACTER_BUILDER_RESULTS_KEY);
  window.localStorage.removeItem(DIALOGUE_BOXES_SCENES_KEY);
  window.localStorage.removeItem(DIALOGUE_BOXES_AUDIO_KEY);
  window.localStorage.removeItem(COMPLETE_AUDIO_KEY);
  setLoadedResults(null);
  setCPResults(null);
  setPSResults(null);
  setScreenplayId(null);
  setResults(null);
  setStatus("");
  setText("");
  console.log("Cleared results");
}
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("Submitting...");
    if (!CPResults || !PSResults){
      setStatus("Load both Character Profiles and Parsed Screenplay first.");
      return;
    }
      
      const response = await fetch(API_URL,{
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          cpResults: CPResults,
          psResults: PSResults
        })
      });
      if (!response.ok){
        console.error("Failed to build dialogue box");
      }
      const data = await response.json();
      setResults(data)

      const {dialogue_boxes_scenes }= data;

      window.localStorage.setItem(DIALOGUE_BOXES_SCENES_KEY,JSON.stringify(dialogue_boxes_scenes));
      setStatus("Built dialogue boxes complete.");
      setLoadedResults({type: "dialogueBoxScenes", results: dialogue_boxes_scenes});
      setResults(dialogue_boxes_scenes);
  };  

  return (
    <main className="min-h-screen bg-[#f4f6fb]">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-10 lg:px-10">

        <header className="space-y-2">

          <h1 className="text-2xl font-bold text-slate-900">Admin: Build Dialogue Boxes per Scene</h1>

        </header>

        <form className="space-y-4" onSubmit={handleSubmit}>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <Link
              href="/admin"
              className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Back to Admin
            </Link>
           
            <div className="flex flex-wrap items-center gap-2">
             <button
           className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
           type="button"
           onClick={handleClear}
           >Clear</button> 
            <button
                className="rounded-full bg-[#f9cf00] px-4 py-2 text-sm font-semibold text-[#1b1b1b] shadow-md transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
                aria-disabled={!hasText}
                tabIndex={hasText ? 0 : -1}
                type="button"
                onClick={handleLoadParsedScreenplay}
              >
                1. Load Parsed Screenplay
            </button>
            <button
                className="rounded-full bg-[#f9cf00] px-4 py-2 text-sm font-semibold text-[#1b1b1b] shadow-md transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
                aria-disabled={!hasText}
                tabIndex={hasText ? 0 : -1}
                type="button"
                onClick={handleLoadCharacterProfiles}
              >
                2.Load Character Profiles
              </button>

              <button
                className="rounded-full bg-[#f9cf00] px-4 py-2 text-sm font-semibold text-[#1b1b1b] shadow-md transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
                aria-disabled={!hasText}
                tabIndex={hasText ? 0 : -1}
                type="submit"
              >
                3. Build Dialogue Boxes
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
         {(loadedResults == null) && (
          <div className="rounded-3xl bg-white p-6 shadow-md ring-1 ring-slate-200">
            <p className="text-sm text-slate-500">
              No data available. 1. Parse Screenplay 2. Build a character  3. Build Dialogue Boxes
            </p>
   
          </div>
        )}


        {(loadedResults !=null) && (  
          <div className="space-y-6">
            {sections.map((section) => (
              <section key={section.title} className="rounded-3xl bg-white p-6 shadow-md ring-1 ring-slate-200">
                <h2 className="text-lg font-semibold text-slate-900">{section.title}</h2>
                <div className="mt-4 space-y-3 text-sm text-slate-700">
                  {section.items.length === 0 && (
                    <p className="text-slate-500">No entries.</p>
                  )}
                 Length: {section.items.length}
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

