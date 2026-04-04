"use client";
import Link from "next/link";

import {  FormEvent, useState,  useMemo } from "react";
import { DIALOGUE_BOXES_SCENES_KEY, CHARACTER_BUILDER_RESULTS_KEY, PARSED_SCREENPLAY_RESULTS_KEY} from "@/lib/constants";

import {DialogueBoxScene, DialogueBox} from "@/lib/types";

const API_URL = "/api/admin/build-audio-per-dialogue-box-scene";

type DialogueBoxesScenesResults = {
    scene_id:string;
    dialogue_boxes_scenes?: Array<{
        character_name: string;
        voice_id: string;
        text: string;
    }>;
}
type CharacterBuilderResults = {
    profiles?: any[];
    characterVoiceIds?: any[];
    profilePrompts?: string[];

  };
  
  type ParsedScreenplayResults = {
    characterFirstScene?: Record<string, number>;
    sceneCount?: number;
    scenes?: Array<{
        id: string;
        sceneNumber: number;
        heading: string;
        dialogue: Array<{ character: string; text: string; isNarration: boolean }>;
      }>;
  }
type ResultsShape = CharacterBuilderResults | ParsedScreenplayResults | DialogueBoxesScenesResults | null;

type Section = {
  title: string;
  items: unknown[];
};

type SectionConfig<TResult> = {
  title: string;
  selectItems: (results: TResult) => unknown[];
};

type LoadedResults = 
| {type: "characterBuilder", results: CharacterBuilderResults} 
| {type: "parsedScreenplay",results: ParsedScreenplayResults}
| {type: "dialogueBoxesScenes", results: DialogueBoxesScenesResults}
| null;

const buildSections = <TResult,>(
  results: TResult | null,
  configs: SectionConfig<TResult>[],
): Section[] => {
  if (!results) return [];
  return configs.map((config) => ({
    title: config.title,
    items: config.selectItems(results),
  }));
};

const dialogueBoxesScenesSectionConfigs: SectionConfig<DialogueBoxesScenesResults>[] = 
[ 
    {
        title: "Scene ID",
        selectItems: (results)=> results.scene_id ? [results.scene_id] : [],
        
    },
    {
        title:"Dialogue Boxes",
        selectItems: (results)=> results.dialogue_boxes_scenes ?? []
    }
]
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


export default  function  BuildAudioPerDialogueBoxScene(){

    const [dialogueBoxesScenes, setDialogueBoxesScenes] = useState<DialogueBoxScene[]>([]);
    const [text, setText, hasText ] = useState(false);
    const [uploadStatus, setUploadStatus ] = useState<string | null>(null);
    const [status, setStatus ] = useState("");

    const [loadedResults, setLoadedResults ] = useState<LoadedResults>(null);
    const sections = useMemo(() => {
        if (loadedResults?.type=="characterBuilder"){
            return buildSections(
                loadedResults.results,
                characterBuilderSectionConfigs,
            );
        }
        if (loadedResults?.type ==="parsedScreenplay"){
            return buildSections(
                loadedResults.results,
                parsedScreenplaySectionConfigs,
            );
        }
        if (loadedResults?.type==="dialogueBoxesScenes"){
            return buildSections(
                loadedResults.results,
                dialogueBoxesScenesSectionConfigs,
            );
        }
        return [];
    },[loadedResults]);



    const handleClear = () =>{
        return null;
    }
    const handleLoadCharacterBuilder = () => {
        const stored = window.localStorage.getItem(CHARACTER_BUILDER_RESULTS_KEY);
        if (!stored) return;
        const parsed = JSON.parse(stored);
        setLoadedResults({results: parsed, type:"characterBuilder"});
    }
    const handleLoadParsedScreenplay = () => {
        const stored = window.localStorage.getItem(PARSED_SCREENPLAY_RESULTS_KEY);
        if (!stored) return;
        const parsed = JSON.parse(stored);
        setLoadedResults({type: "parsedScreenplay", results: parsed});
    }
    const handleLoadDialogueBoxesScenes = ()=> {
        const stored = window.localStorage.getItem(DIALOGUE_BOXES_SCENES_KEY);
        if (!stored) return;
        const parsed = JSON.parse(stored);
        setDialogueBoxesScenes(parsed);
    }
    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const result = await fetch(API_URL,{
            method:"POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                dialogue_boxes_scenes: dialogueBoxesScenes,
            })
        });
        const data = await result.json();
        console.log("Server response", data);
        if (!result.ok){ 
            console.error("API error");
        }
    }

    return (
        <main className="min-h-screen bg-[#f4f6fb]">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-10 lg:px-10">

        <header className="space-y-2">

          <h1 className="text-2xl font-bold text-slate-900">Admin: Build Audio Per Dialogue Box</h1>

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
                onClick={handleLoadCharacterBuilder}
                type="button"
              >
                1. Load Character Builder
              </button>

              <button
              className="rounded-full bg-[#f9cf00] px-4 py-2 text-sm font-semibold text-[#1b1b1b] shadow-md transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
              aria-disabled={!hasText}
              onClick={handleLoadParsedScreenplay}
              type="button"
              >
                2. Load Parsed Screenplay 
              </button>
              <button
                className="rounded-full bg-[#f9cf00] px-4 py-2 text-sm font-semibold text-[#1b1b1b] shadow-md transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
                aria-disabled={!hasText}
                tabIndex={hasText ? 0 : -1}
                type="button"
                onClick={handleLoadDialogueBoxesScenes}
              >
                3. Build Dialogue Boxes
              </button>

              <button
                className="rounded-full bg-[#f9cf00] px-4 py-2 text-sm font-semibold text-[#1b1b1b] shadow-md transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
                aria-disabled={!hasText}
                tabIndex={hasText ? 0 : -1}
                type="submit"
              >
                4. Build Audio 
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
              No data available. 1. Build a character 2. Parse Screenplay. 3. Build Dialogue Boxes 4. Build Audio
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
    )

}