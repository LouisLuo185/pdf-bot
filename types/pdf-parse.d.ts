declare module "pdf-parse" {
  type PdfParsePageData = {
    getTextContent: (options?: {
      normalizeWhitespace?: boolean;
      disableCombineTextItems?: boolean;
    }) => Promise<{
      items: Array<{
        str: string;
        transform: number[];
      }>;
    }>;
  };

  type PdfParseOptions = {
    pagerender?: (pageData: PdfParsePageData) => Promise<string> | string;
    max?: number;
    version?: string;
  };

  type PdfParseResult = {
    numpages: number;
    numrender: number;
    info?: Record<string, unknown>;
    metadata?: unknown;
    version?: string;
    text: string;
  };

  export default function pdfParse(
    dataBuffer: Buffer,
    options?: PdfParseOptions
  ): Promise<PdfParseResult>;
}
