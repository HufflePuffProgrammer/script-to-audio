"use client";
import Link from "next/link";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { DIALOGUE_BOXES_SCENES_KEY, CHARACTER_BUILDER_RESULTS_KEY, PARSED_SCREENPLAY_RESULTS_KEY, DIALOGUE_BOXES_AUDIO_KEY} from "@/lib/constants";

import {DialogueBoxScene, DialogueBox, Scene} from "@/lib/types";
const API_URL = "/api/admin/build-audio-per-dialogue-box-scene";
const GENERATE_SCENE_AUDIO_URL = "/api/admin/generate-dialogue-box-scene-audio";

type AudioPerDialogueBoxesResults = {
  scene_id:string;
  heading: string;
  scenes: Scene[];
}
/** Matches localStorage: build-dialogue-box saves `JSON.stringify(dialogue_boxes_scenes)` → `DialogueBoxScene[]`. */

type DialogueBoxesScenesLoaded = DialogueBoxScene[];
type CharacterBuilderResults = {
    profiles?: any[];
    characterVoiceIds?: any[];
    profilePrompts?: string[];
  };
  
  type ParsedScreenplayResults = {
    screenplay_id?: string;
    characterFirstScene?: Record<string, number>;
    sceneCount?: number;
    scenes?: Array<{
        id: string;
        sceneNumber: number;
        heading: string;
        dialogue: Array<{ character: string; text: string; isNarration: boolean }>;
      }>;
  }
type ResultsShape =
  | CharacterBuilderResults
  | ParsedScreenplayResults
  | DialogueBoxesScenesLoaded
  | AudioPerDialogueBoxesResults
  | null;

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
| { type: "dialogueBoxesScenes"; results: DialogueBoxesScenesLoaded }
| {type: "audioPerDialogueBoxes", results: AudioPerDialogueBoxesResults}
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

const audioPerDialogueBoxesSectionConfigs: SectionConfig<AudioPerDialogueBoxesResults>[] = 
[
  {
    title: "Scenes",
   
    selectItems: (results)=> results.scene_id ? [results.scene_id] :[],
  },
  
]

const dialogueBoxesScenesSectionConfigs: SectionConfig<DialogueBoxesScenesLoaded>[] = [
  {
    title: "Scene IDs",
    selectItems: (results) => results.map((s) => s.scene_id),
  },
  {
    title: "Scene Number",
    selectItems: (results) => results.map((s) => s.sceneNumber),
  },
  {
    title: "Heading",
    selectItems: (results) => results.map((s) => s.heading),
  },
  {
    title: "Characters",
    selectItems: (results) => results.map((s) => s.characters),
  },
  {
    title: "Dialogue Boxes",
    selectItems: (results) => results.flatMap((s) => s.dialogue_boxes),
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
    title: "Screenplay ID",
    selectItems: (results) =>
      results.screenplay_id ? [results.screenplay_id] : [],
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
    const [hasText, setHasText] = useState(false);
    const [uploadStatus, setUploadStatus ] = useState<string | null>(null);
    const [status, setStatus ] = useState("");

    const [loadedResults, setLoadedResults ] = useState<LoadedResults>(null);
    const [results, setResults] = useState<ResultsShape | null>(null);
    const [audioUrls, setAudioUrls] = useState<Record<string, string>>({});
    const [audioStatus, setAudioStatus] = useState<Record<string, "idle" | "loading" | "ready" | "error">>({});
    const [hasDialogueBoxesForAudio, setHasDialogueBoxesForAudio] = useState(false);
    const [parsedScreenplayId,setParsedScreenplayId] = useState<string | null>(null);
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
        if (loadedResults?.type==="audioPerDialogueBoxes"){
          return buildSections(
              loadedResults.results,
              audioPerDialogueBoxesSectionConfigs,
          );
      }
        return [];
    },[loadedResults]);

    useEffect(() => {
      if (!hasDialogueBoxesForAudio || dialogueBoxesScenes.length === 0) return;
      window.localStorage.setItem(
        DIALOGUE_BOXES_AUDIO_KEY,
        JSON.stringify(dialogueBoxesScenes),
      );
    }, [dialogueBoxesScenes, hasDialogueBoxesForAudio]);

    const handleClear = () =>{
      console.log("Clearing all data");
        return null;
    }
    const handleLoadDialogueBoxesForAudio = () =>{

      const stored = window.localStorage.getItem(DIALOGUE_BOXES_SCENES_KEY);
      if (!stored) return;
      const raw: unknown = JSON.parse(stored);
      const parsed: DialogueBoxesScenesLoaded = Array.isArray(raw)
        ? raw
        : raw !== null &&
            typeof raw === "object" &&
            "dialogue_boxes_scenes" in raw &&
            Array.isArray((raw as { dialogue_boxes_scenes: unknown }).dialogue_boxes_scenes)
          ? (raw as { dialogue_boxes_scenes: DialogueBoxScene[] }).dialogue_boxes_scenes
          : [];

      setDialogueBoxesScenes(parsed);
      setLoadedResults({type: "dialogueBoxesScenes", results: parsed}); 
      setHasDialogueBoxesForAudio(true);

      const AudioPerDialogueBoxesResults: AudioPerDialogueBoxesResults = {
        scene_id: "123",
        heading: "123",
        scenes: parsed.map((scene) => ({
          id: scene.scene_id,
          dialogue: scene.dialogue_boxes.map((dialogue) => ({
            character: dialogue.character_name,
            text: dialogue.text,
            isNarration: dialogue.isNarration,
          })),
          sceneNumber: scene.sceneNumber,
          heading: scene.heading,
          characters: scene.characters,
          audio_url: scene.audio_url,
        })),
      }
       setLoadedResults({type: "audioPerDialogueBoxes", results: AudioPerDialogueBoxesResults}); 
       setHasText(true);
       setStatus("Loaded build audio for dialogue boxes complete.");
    }
    const handleLoadCharacterBuilder = () => {
        const stored = window.localStorage.getItem(CHARACTER_BUILDER_RESULTS_KEY);
        if (!stored) return;
        const parsed = JSON.parse(stored);
        setLoadedResults({type:"characterBuilder",results:parsed});
        setHasText(true);
        setStatus("Loaded character builder complete.");
        setHasDialogueBoxesForAudio(false);
    }
    const handleLoadParsedScreenplay = () => {
        const stored = window.localStorage.getItem(PARSED_SCREENPLAY_RESULTS_KEY);
        if (!stored) return;
        const parsed = JSON.parse(stored);
        setLoadedResults({type: "parsedScreenplay", results: parsed});
        setParsedScreenplayId( parsed.screenplay_id);
        setHasText(true);
        setStatus("Loaded parsed screenplay complete.");
        setHasDialogueBoxesForAudio(false);
      }
    const handleLoadDialogueBoxesScenes = ()=> {
        const stored = window.localStorage.getItem(DIALOGUE_BOXES_SCENES_KEY);

        if (!stored) return;
        const raw: unknown = JSON.parse(stored);
        const parsed: DialogueBoxesScenesLoaded = Array.isArray(raw)
          ? raw
          : raw !== null &&
              typeof raw === "object" &&
              "dialogue_boxes_scenes" in raw &&
              Array.isArray((raw as { dialogue_boxes_scenes: unknown }).dialogue_boxes_scenes)
            ? (raw as { dialogue_boxes_scenes: DialogueBoxScene[] }).dialogue_boxes_scenes
            : [];

        setDialogueBoxesScenes(parsed);
        setLoadedResults({type: "dialogueBoxesScenes", results: parsed}); 
        setHasText(true);
        setStatus("Loaded dialogue boxes scenes complete.");
        setHasDialogueBoxesForAudio(false);
       
    }
    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setStatus("Submitting...");
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
        setResults(data);
        window.localStorage.setItem(DIALOGUE_BOXES_AUDIO_KEY,JSON.stringify(data));

        setStatus("Built audio per dialogue box complete.");
        if (!result.ok){ 
            console.error("API error");
        }
        setHasDialogueBoxesForAudio(false);
    }

    const generateAudio = async (scene: DialogueBoxScene) => {
      setAudioStatus((prev) => ({ ...prev, [scene.scene_id]: "loading" }));
      try {
        const response = await fetch(GENERATE_SCENE_AUDIO_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ dialogueBoxScene: scene, parsedScreenplayId: parsedScreenplayId ?? null }),
        });
       
        const data: { audio_url?: string; error?: string | null } = await response.json();
        if (!response.ok || data.error || !data.audio_url) {
          console.error("Generate scene audio failed:", data.error ?? response.statusText);
          setAudioStatus((prev) => ({ ...prev, [scene.scene_id]: "error" }));
          return;
        }
        setAudioUrls((prev) => {
          const next = { ...prev, [scene.scene_id]: data.audio_url! };
          return next;
        });
        console.log("audio URLS", data.audio_url);
        setDialogueBoxesScenes((prev) => {
          const next = prev.map((s) => s.scene_id === scene.scene_id ? { ...s, audio_url: data.audio_url! } : s);
          return next;
        });
        console.log("DIALOGUE BOXES AUDIO_KEY:", dialogueBoxesScenes);
        window.localStorage.setItem(DIALOGUE_BOXES_AUDIO_KEY,JSON.stringify(dialogueBoxesScenes));
        setAudioStatus((prev) => ({ ...prev, [scene.scene_id]: "ready" }));
      } catch (error) {
        setAudioStatus((prev) => ({ ...prev, [scene.scene_id]: "error" }));
      }
    };
  
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
                type="button"
                onClick={handleLoadDialogueBoxesForAudio}
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
             0. No data available. 1. Build a character 2. Parse Screenplay. 3. Build Dialogue Boxes 4. Build Audio
            </p>
   
          </div>
        )}
         {(loadedResults !=null) && !hasDialogueBoxesForAudio && (  
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
        ) }
        {(loadedResults!=null) && (hasDialogueBoxesForAudio) &&(
            <div className="space-y-6">

                <section key={sections[0].title} className="rounded-3xl bg-white p-6 shadow-md ring-1 ring-slate-200">
                  <h2 className="text-lg font-semibold text-slate-900">{sections[0].title}</h2>
                  <div className="mt-4 space-y-3 text-sm text-slate-700">
                    {
                      dialogueBoxesScenes.map((scene)=>(
                      <div
                          key={scene.scene_id}
                          className="space-y-2 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200"
                        >
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-semibold text-slate-900">
                            <span className="text-xs text-slate-500">scene ID: {scene.scene_id}</span><br/>Scene {scene.sceneNumber}
                            </p>
                            <span className="text-xs text-slate-500">{scene.heading}</span>
                          </div>
                          <div className="h-2 w-full overflow-hidden rounded-full bg-white ring-1 ring-slate-200">
                            <div className="h-full w-[45%] rounded-full bg-gradient-to-r from-indigo-500 to-purple-500" />
                          </div>
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => generateAudio(scene)}
                              disabled={audioStatus[scene.scene_id] === "loading"}
                              className="rounded-full bg-[#f9cf00] px-3 py-1 text-xs font-semibold text-[#1b1b1b] shadow-sm transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {audioStatus[scene.scene_id] === "loading" ? "Generating..." : "Generate audio"}
                            </button>
                            {audioStatus[scene.scene_id] === "error" && (
                              <span className="text-xs text-red-600">Failed. Retry.</span>
                            )}
                          </div>
                          {audioUrls[scene.scene_id] && (
                            <div className="mt-2 w-full">
                            <a href={audioUrls[scene.scene_id]} download>Download audio</a>
                            </div>
                          )}
                          
                          {audioUrls[scene.scene_id] && (
                            <audio
                              key={audioUrls[scene.scene_id]}
                              controls
                              className="mt-2 w-full"
                              crossOrigin="anonymous"
                            >
                              <source src={audioUrls[scene.scene_id]} type="audio/mpeg" />
                            </audio>
                          )}
                        </div>
                      )
                    )
                }                  
                </div>
                </section>
             </div>
        )
      }
      </div>
    </main>
    )

}
