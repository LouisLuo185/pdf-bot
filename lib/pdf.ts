import pdfParse from "pdf-parse";
import type { PdfPageText } from "../types/document.ts";

type PdfJsPageData = {
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

export function normalizePdfPageText(text: string): string {
  return text
    .replace(/\u0000/g, "")
    .replace(/\r/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

export function hasMeaningfulPdfText(text: string): boolean {
  return normalizePdfPageText(text).replace(/[\s\W_]+/g, "").length > 0;
}

async function renderPageText(pageData: PdfJsPageData): Promise<string> {
  const textContent = await pageData.getTextContent({
    normalizeWhitespace: true,
    disableCombineTextItems: false
  });

  let lastY: number | undefined;
  let text = "";

  for (const item of textContent.items) {
    const currentY = item.transform?.[5];
    if (lastY === undefined || currentY === lastY) {
      text += item.str;
    } else {
      text += `\n${item.str}`;
    }
    lastY = currentY;
  }

  return normalizePdfPageText(text);
}

export async function extractPdfText(fileBuffer: Buffer): Promise<PdfPageText[]> {
  const pages: PdfPageText[] = [];
  let pageNumber = 0;

  await pdfParse(fileBuffer, {
    pagerender: async (pageData: PdfJsPageData) => {
      pageNumber += 1;
      const text = await renderPageText(pageData);
      pages.push({
        pageNumber,
        text
      });
      return text;
    }
  });

  return pages.filter((page) => hasMeaningfulPdfText(page.text));
}
