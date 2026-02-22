declare module "pdfjs-dist/legacy/build/pdf" {
  export const GlobalWorkerOptions: {
    workerSrc?: string;
  };

  export interface PDFPageTextContentItem {
    str?: string;
  }

  export interface PDFPageTextContent {
    items: PDFPageTextContentItem[];
  }

  export interface PDFPageProxy {
    getTextContent(): Promise<PDFPageTextContent>;
  }

  export interface PDFDocumentProxy {
    numPages: number;
    getPage(pageNumber: number): Promise<PDFPageProxy>;
  }

  export function getDocument(source: any): {
    promise: Promise<PDFDocumentProxy>;
  };
}

