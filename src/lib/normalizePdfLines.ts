export type PdfPositionedTextItem = {
  str?: string;
  x: number;
  y: number;
};

export type PdfJsTextItemLike = {
  str?: string;
  transform?: number[];
};

export type NormalizedPdfLine = {
  text: string;
  xStart: number;
  y: number;
  indentBucket: "left" | "dialogue" | "centered" | "right";
  roleHint: "narration" | "dialogue" | "characterCue" | "pageNumber";
};

const uppercaseLinePattern = /^[A-Z0-9\s.'()\-]{2,40}$/;
const pageNumberPattern = /^\d+$/;
const titleIndicatorPattern = /written\s+by/i;
export const titlePageMarker = "[[TITLE_PAGE]]";

const classifyIndentBucket = (xStart: number) => {
  if (xStart >= 500) {
    return "right" as const;
  }
  if (xStart >= 220) {
    return "centered" as const;
  }
  if (xStart >= 140) {
    return "dialogue" as const;
  }
  return "left" as const;
};

const classifyRoleHint = (
  text: string,
  indentBucket: NormalizedPdfLine["indentBucket"],
  y: number,
  topY: number,
) => {
  const isNearTopOfPage = topY - y <= 72;
  if (indentBucket === "right" && isNearTopOfPage && pageNumberPattern.test(text)) {
    return "pageNumber" as const;
  }
  if (indentBucket === "centered" && uppercaseLinePattern.test(text) && text === text.toUpperCase()) {
    return "characterCue" as const;
  }
  if (indentBucket === "dialogue") {
    return "dialogue" as const;
  }
  return "narration" as const;
};

export function mapPdfJsItems(items: PdfJsTextItemLike[]): PdfPositionedTextItem[] {
  return items
    .filter((item) => item.str)
    .map((item) => ({
      str: item.str,
      x: item.transform?.[4] ?? 0,
      y: item.transform?.[5] ?? 0,
    }));
}

export function normalizePdfLines(
  items: PdfPositionedTextItem[],
  lineYTolerance = 5,
): NormalizedPdfLine[] {
  const sortedItems = [...items]
    .filter((item) => item.str?.trim())
    .sort((a, b) => {
      if (Math.abs(b.y - a.y) > lineYTolerance) {
        return b.y - a.y;
      }
      return a.x - b.x;
    });

  const groupedLines: Array<{ y: number; items: PdfPositionedTextItem[] }> = [];

  for (const item of sortedItems) {
    const currentLine = groupedLines[groupedLines.length - 1];
    if (!currentLine || Math.abs(currentLine.y - item.y) > lineYTolerance) {
      groupedLines.push({ y: item.y, items: [item] });
      continue;
    }
    currentLine.items.push(item);
  }

  const topY = groupedLines[0]?.y ?? 0;

  return groupedLines.map((line) => {
    const lineItems = [...line.items].sort((a, b) => a.x - b.x);
    const text = lineItems
      .map((item) => item.str?.trim())
      .filter(Boolean)
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();
    const xStart = lineItems[0]?.x ?? 0;
    const indentBucket = classifyIndentBucket(xStart);

    return {
      text,
      xStart,
      y: line.y,
      indentBucket,
      roleHint: classifyRoleHint(text, indentBucket, line.y, topY),
    };
  });
}

export function buildNormalizedScriptText(lines: NormalizedPdfLine[]) {
  const normalizedLines = lines.map((line) => {
    if (line.roleHint === "pageNumber") {
      return null;
    }
    if (line.roleHint === "characterCue") {
      return line.text;
    }
    if (line.roleHint === "dialogue") {
      return `    ${line.text}`;
    }
    return line.text;
  });

  if (isLikelyTitlePage(lines)) {
    normalizedLines.unshift(titlePageMarker);
  }

  return normalizedLines.filter(Boolean).join("\n");
}

export function isLikelyTitlePage(lines: NormalizedPdfLine[]) {
  return lines.slice(0, 12).some((line) => titleIndicatorPattern.test(line.text));
}
