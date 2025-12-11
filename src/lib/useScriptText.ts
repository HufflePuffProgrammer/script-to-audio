"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "script-to-audio:scriptText";

export function useScriptText() {
  const [text, setText] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved) setText(saved);
  }, []);

  const update = (value: string) => {
    setText(value);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, value);
    }
  };

  const clear = () => {
    setText("");
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  };

  return {
    text,
    setText: update,
    clear,
    hasText: text.trim().length > 0,
    characters: text.length,
  };
}

