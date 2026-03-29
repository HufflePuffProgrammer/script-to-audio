export type DialogueLine = {
  character: string;
  text: string;
  /**
   * Marks narration-like lines (scene headings, descriptions, parentheticals).
   */
  isNarration?: boolean;
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
  age?: string;
  gender?: string;
  traits?: string;
  voiceStyle?: string;
  confidence?: string;
};

export type CharacterInput = {
  genre: string;
  character: string;
  sceneContext: string;
  dialogue: string[];
};
export type AudioStatus = "idle" | "generating" | "ready" | "error";

export type CharacterVoiceIds = [
  {
    character_name: string;
    voice_id: string;
    description: string;
    labels: string;
    reason: string;
  }
]


//export const ageDescriptorPattern = /\((?:\s*\d{1,3}s|\s*\d{1,3} ?years|[^)]*(?:years old|yrs old|year old))\b/i;
//export type stageDirectionPattern = /^(CLOSE ON|ANGLE ON|CUT TO|PAN TO|DISSOLVE TO|FADE (IN|OUT)|CAMERA|A VOICE)/i;