"use client";

import { useEffect, useState } from "react";
import { Scene } from "./types";

export type ParsedScenesCache = {
  scenes: Scene[];
  sceneCount: number;
  characterFirstScene: Record<string, number>;
  audioUrls?: Record<string, string>;
};

const STORAGE_KEY = "script-to-audio:parsedScenes";

export function useParsedScenes() {
  const [data, setDataState] = useState<ParsedScenesCache | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setDataState(JSON.parse(saved));
      } catch {
        // ignore invalid cache
      }
    }
  }, []);

  const setData = (value: ParsedScenesCache | null) => {
    setDataState(value);
    if (typeof window === "undefined") return;
    if (!value) {
      window.localStorage.removeItem(STORAGE_KEY);
    } else {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    }
  };

  const clear = () => setData(null);

  return {
    data,
    setData,
    clear,
    hasScenes: !!data?.scenes?.length,
  };
}

