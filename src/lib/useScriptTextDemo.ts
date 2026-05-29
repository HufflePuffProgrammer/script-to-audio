"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "script-to-audio:scriptText";
export const CHARACTER_BUILDER_RESULTS_KEY = "characterBuilderResults";
export const PARSED_SCREENPLAY_RESULTS_KEY = "parsedScreenplayResults";
export const DIALOGUE_BOXES_SCENES_KEY = "dialogueBoxesScenes";
export function useScriptText() {
 
  const [text, setText] = useState("");
  const textDemo =   `A Day in the life of a senior software engineer
written by
Richard Soriano

INT. OFFICE - DAY
PATRICIA,a mature, business mind woman in her 50's, strides into the office. She's panicked.
RICHARD, cool, calm and mature man in his early 40's, sits calmly at the table.
PATRICIA
     I heard that users couldn't login after the deployment.
RICHARD
     The bug has been fixed. It has been redeployed last night. All systems are up and running. We are good to go!
PATRICIA
     Thank you, Richard Soriano. I'm so glad I hired you.   You're a lifesaver.

INT. BASEMENT - NIGHT
JENNIFER, late teens, nerdy, glasses, nervously tip toes down the stairs. It's pitch black.
GRACE, late teens and her best friend. She's into goth and has a wild, care-free attitude. She trails Carol down the basement steps.

JENNIFER
     I can't see.
     Grace?  Grace?
GRACE
     BOO!
JENNIFER 
     Cut that out. I'm terrified. Your hands are cold.
GRACE
     That's not me. I'm holding the candles and the ouija board.
JENNIFER
     Well, then who's hand-- am I -- holding?  `;
  
  
     useEffect(() => {
   
    setText(textDemo)
    /*
    if (typeof window === "undefined") return;
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved) setText(saved);
    */
  }, []);

  const update = (value: string) => {
    setText(textDemo);
   // setText(value);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, value);
    }
  };

  const clearCharacterBuilder = () => {
    setText(textDemo);
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_KEY);
      window.localStorage.removeItem(CHARACTER_BUILDER_RESULTS_KEY);
    }
  };
  const clearParsedScreenplay = () => {
    setText(textDemo);
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_KEY);
      window.localStorage.removeItem(PARSED_SCREENPLAY_RESULTS_KEY);
    }
  };

  /** Clears the saved script text from state and localStorage. */
  const clear = () => {
    update("");
  };

  return {
    text,
    setText: update,
    clear,
    clearCharacterBuilder,
    clearParsedScreenplay,
    hasText: text.trim().length > 0,
    characters: text.length,
  };
}

