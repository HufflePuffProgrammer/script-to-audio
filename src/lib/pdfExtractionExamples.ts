export const pdfLineExamples = [
  {
    name: "Title page should emit a marker",
    pageItems: [
      { str: "NEXT STOP HEAVEN", x: 180, y: 720 },
      { str: "Written by", x: 210, y: 680 },
      { str: "W. Drum", x: 220, y: 650 },
    ],
    normalizedLines: [
      { text: "NEXT STOP HEAVEN", roleHint: "narration", indentBucket: "dialogue" },
      { text: "Written by", roleHint: "narration", indentBucket: "dialogue" },
      { text: "W. Drum", roleHint: "narration", indentBucket: "centered" },
    ],
    expectedParsedDialogue: [
      {
        character: "NARRATOR",
        text: "[[TITLE_PAGE]] NEXT STOP HEAVEN Written by W. Drum",
        isNarration: true,
      },
    ],
  },
  {
    name: "Centered character and dialogue, followed by narration",
    pageItems: [
      { str: "JANET", x: 245, y: 700 },
      { str: "Fuck it. Death, just take me now.", x: 180, y: 680 },
      {
        str: "This is JANET (90s, Sophia from Golden Girls but with an even dirtier mouth).",
        x: 40,
        y: 645,
      },
    ],
    normalizedLines: [
      { text: "JANET", roleHint: "characterCue", indentBucket: "centered" },
      {
        text: "Fuck it. Death, just take me now.",
        roleHint: "dialogue",
        indentBucket: "dialogue",
      },
      {
        text: "This is JANET (90s, Sophia from Golden Girls but with an even dirtier mouth).",
        roleHint: "narration",
        indentBucket: "left",
      },
    ],
    expectedParsedDialogue: [
      {
        character: "JANET",
        text: "Fuck it. Death, just take me now.",
        isNarration: false,
      },
      {
        character: "NARRATOR",
        text: "This is JANET (90s, Sophia from Golden Girls but with an even dirtier mouth).",
        isNarration: true,
      },
    ],
  },
  {
    name: "Narration block before a character speaks",
    pageItems: [
      { str: "It's a gorgeous day outside.", x: 42, y: 700 },
      { str: "SASSY SENIORS wave as they pass by one another.", x: 42, y: 680 },
      { str: "JANET", x: 245, y: 640 },
      { str: "I hate how happy everyone is.", x: 180, y: 620 },
    ],
    normalizedLines: [
      { text: "It's a gorgeous day outside.", roleHint: "narration", indentBucket: "left" },
      {
        text: "SASSY SENIORS wave as they pass by one another.",
        roleHint: "narration",
        indentBucket: "left",
      },
      { text: "JANET", roleHint: "characterCue", indentBucket: "centered" },
      {
        text: "I hate how happy everyone is.",
        roleHint: "dialogue",
        indentBucket: "dialogue",
      },
    ],
    expectedParsedDialogue: [
      {
        character: "NARRATOR",
        text: "It's a gorgeous day outside. SASSY SENIORS wave as they pass by one another.",
        isNarration: true,
      },
      {
        character: "JANET",
        text: "I hate how happy everyone is.",
        isNarration: false,
      },
    ],
  },
] as const;
