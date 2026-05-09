import { ChangeEvent, Dispatch, SetStateAction, useState } from "react";
import {
  buildNormalizedScriptText,
  mapPdfJsItems,
  normalizePdfLines,
} from "@/lib/normalizePdfLines";
import { clearAdminWorkflowLocalStorage } from "@/lib/adminWorkflowStorage";
import { ResultsShape } from "@/lib/types";

type UseParseScreenplayActionsArgs = {
  setText: (value: string) => void;
  setResults: Dispatch<SetStateAction<ResultsShape | null>>;
  setStatus: (value: string) => void;
};

export function useParseScreenplayActions({
  setText,
  setResults,
  setStatus,
}: UseParseScreenplayActionsArgs) {
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);

  const handleClear = () => {
    clearAdminWorkflowLocalStorage();
    setResults(null);
    setStatus("");
    setText("");
    setUploadStatus(null);
  };

  const handlePdfUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    console.log("file:", file?.name);
    if (!file) return;
    if (file.type !== "application/pdf") {
      setUploadStatus("Only PDF uploads are supported right now.");
      return;
    }

    setIsExtracting(true);
    setUploadStatus("Extracting text from PDF...");
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfjs = await import("pdfjs-dist/legacy/build/pdf");
      pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
      const document = await pdfjs.getDocument({ data: arrayBuffer }).promise;
      let normalizedExtractedText = "";

      for (let pageIndex = 1; pageIndex <= document.numPages; pageIndex += 1) {
        const page = await document.getPage(pageIndex);
        const content = await (
          page as {
            getTextContent: (options?: {
              normalizeWhitespace?: boolean;
              disableCombineTextItems?: boolean;
            }) => ReturnType<typeof page.getTextContent>;
          }
        ).getTextContent({
          normalizeWhitespace: false,
          disableCombineTextItems: true,
        });
        const positionedItems = mapPdfJsItems(
          content.items as Array<{ str?: string; transform?: number[] }>,
        );
        const normalizedLines = normalizePdfLines(positionedItems);
        const normalizedPageText = buildNormalizedScriptText(normalizedLines);
        normalizedExtractedText += `${normalizedPageText}\n`;
      }
      console.log("normalizedExtractedText:", normalizedExtractedText);
      setText(normalizedExtractedText);
      setUploadStatus("PDF text extracted successfully.");
    } catch (error) {
      console.error("Failed to parse PDF", error);
      setUploadStatus("Could not extract text from this PDF.");
    } finally {
      setIsExtracting(false);
    }
  };

  return { isExtracting, uploadStatus, handleClear, handlePdfUpload };
}
