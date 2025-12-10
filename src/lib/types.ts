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

export type Screenplay = {
  id: string;
  title: string;
  sceneCount: number;
  scenes: Scene[];
};

export type CharacterProfile = {
  name: string;
  age?: string;
  gender?: string;
  traits?: string;
  voiceStyle?: string;
  confidence?: string;
};

export type AudioStatus = "idle" | "generating" | "ready" | "error";

