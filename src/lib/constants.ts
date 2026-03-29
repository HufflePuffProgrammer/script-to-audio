export const profilingSceneLimitDefault = 1;

export const profilingSceneLimitOptions = [1, 2, 3];

export const narratorLabel = "NARRATOR";

export const appName = "Script-to-Audio";

export const headingPattern = /^(INT\.|EXT\.)/i;
export const characterPattern = /^[A-Z0-9\s.'()\-]{2,40}$/;
export const ageDescriptorPattern = /\((?:\s*\d{1,3}s|\s*\d{1,3} ?years|[^)]*(?:years old|yrs old|year old))\b/i;
export const narratorOnlyPattern = /^FADE IN:$/i;
export const indentedLinePattern = /^\s{2,}/;

export const titlePageMarker = "[[TITLE_PAGE]]";
export const stageDirectionPattern = /^(CLOSE ON|ANGLE ON|CUT TO|PAN TO|DISSOLVE TO|FADE (IN|OUT)|CAMERA|A VOICE)/i;
export const stageDirectionVerbs = [
    "opens",
    "bursts",
    "walks",
    "runs",
    "stands",
    "sits",
    "comes",
    "goes",
    "arrives",
    "enters",
    "exits",
    "rushes",
    "throws",
    "carries",
    "leans",
    "holds",
    "grabs",
    "points",
    "shouts",
    "whispers",
    "smiles",
    "laughs",
    "stares",
    "gazes",
    "falls",
    "spins",
    "flips",
    "opens",
    "slams",
    "breaks",
  ];
  