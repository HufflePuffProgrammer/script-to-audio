"use client";

import { useEffect, useState } from "react";

/** Same storage as `useScriptText` so character-builder steps share pasted script text. */
const STORAGE_KEY = "script-to-audio:scriptText";

export function useScriptTextPaste() {
  const [textPaste, setTextPasteState] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved) setTextPasteState(saved);
  }, []);

  const setTextPaste = (value: string) => {
    setTextPasteState(value);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, value);
    }
  };

  const clear = () => {
    setTextPasteState("");
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  };

  return {
    textPaste,
    setTextPaste,
    clear,
    hasText: textPaste.trim().length > 0,
    characters: textPaste.length,
  };
}
