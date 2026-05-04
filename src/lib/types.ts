export type DialogueLine = {
  character: string;
  text: string;
  isNarration?: boolean;
  voice_id?: string;
  /**
   * Marks narration-like lines (scene headings, descriptions, parentheticals).
   */

};

export type Scene = {
  id: string;
  sceneNumber: number;
  heading: string;
  characters: string[];
  dialogue: DialogueLine[];
  summary?: string;
};

export type ScreenplayCharacteristics = {
  genre?: string;
  tone?: string;
  setting?: string;
  timePeriod?: string;
  audience?: string;
  themes?: string[];
};

export type Screenplay = {
  id: string;
  title: string;
  sceneCount: number;
  scenes: Scene[];
  characteristics?: ScreenplayCharacteristics;
};

export type CharacterProfile = {
  name: string;
  age: string;
  gender?: string;
  traits?: string;
  voiceStyle?: string;
  speechPattern?: string;
  tone?: string;
  confidence?: string;
};

export type CharacterInput = {
  genre: string;
  character: string;
  sceneContext: string;
  dialogue: string[];
};
export type AudioStatus = "idle" | "generating" | "ready" | "error";

export type AvailableVoices = [{
    voice_id: string;
    description: string;
    labels: string;
  }]
  
export type CharacterVoiceIds = {
  character_name: string;
  voice_id: string;
  description: string;
  labels: string;
  reason: string;
};

export type DialogueBox = {
  character_name: string,
  voice_id: string,
  text: string,
  isNarration?: boolean,
}


export type DialogueBoxScene = {
  scene_id: string,
  sceneNumber: number;
  heading: string;
  characters: string[];
  audio_url: string;
  dialogue_boxes: DialogueBox[],
}

/** Array returned from build-dialogue-box API (`dialogue_boxes_scenes`). */
export type DialogueBoxScenesResults = DialogueBoxScene[];
export type CharacterBuilderResults = {
  profiles?: CharacterProfile[] | null;
  characterVoiceIds?: CharacterVoiceIds[] | null;
  profilePrompts?: string[];
};
export type ParsedScreenplayResults = {
  screenplay_id?: string;
  characterFirstScene?: Record<string, number>;
  sceneCount?: number;
  scenes?: Array<{
    id: string;
    sceneNumber: number;
    heading: string;
    dialogue: Array<{
      character: string;
      text: string;
      isNarration: boolean;
    }>;
  }>;
}
export type ResultsShape = 
| DialogueBoxScenesResults 
| CharacterBuilderResults 
| ParsedScreenplayResults 
| null;

export type LoadedResults = 
| {type: "characterBuilder", results: CharacterBuilderResults}
| {type: "parsedScreenplay", results: ParsedScreenplayResults}
| {type: "dialogueBoxScenes", results: DialogueBoxScenesResults}
|null;

export type Section = {
  title: string;
  items: unknown[];
}
export type SectionConfig<TResult> = {
  title: string;
  selectItems: (results: TResult) => unknown[];
}
export const buildSections = <TResult,>(
  results: TResult | null,
  configs: SectionConfig<TResult>[],
): Section[] =>{
    if (!results) return [];
    return configs.map((config)=> ({
      title:config.title,
      items: config.selectItems(results),
    }))
};


// exporttype AudioPerDialogueBoxesResults = {
//   scene_id:string;
//   heading: string;
//   scenes: Scene[];
// }
//export const ageDescriptorPattern = /\((?:\s*\d{1,3}s|\s*\d{1,3} ?years|[^)]*(?:years old|yrs old|year old))\b/i;
//export type stageDirectionPattern = /^(CLOSE ON|ANGLE ON|CUT TO|PAN TO|DISSOLVE TO|FADE (IN|OUT)|CAMERA|A VOICE)/i;