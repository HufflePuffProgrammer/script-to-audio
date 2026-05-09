import {
  CHARACTER_BUILDER_RESULTS_KEY,
  COMPLETE_AUDIO_KEY,
  DIALOGUE_BOXES_AUDIO_KEY,
  DIALOGUE_BOXES_SCENES_KEY,
  PARSED_SCREENPLAY_RESULTS_KEY,
} from "@/lib/constants";

/** Removes all workflow-related keys from localStorage (admin pipeline). */
export function clearAdminWorkflowLocalStorage(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(PARSED_SCREENPLAY_RESULTS_KEY);
  window.localStorage.removeItem(CHARACTER_BUILDER_RESULTS_KEY);
  window.localStorage.removeItem(DIALOGUE_BOXES_SCENES_KEY);
  window.localStorage.removeItem(DIALOGUE_BOXES_AUDIO_KEY);
  window.localStorage.removeItem(COMPLETE_AUDIO_KEY);
}
