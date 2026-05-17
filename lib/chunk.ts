import { DEFAULT_CHUNK_CHAR_SIZE, DEFAULT_CHUNK_OVERLAP } from "./constants.ts";
import type { PdfPageText, DocumentChunk } from "../types/document.ts";

export function chunkPdfPages(
  pages: PdfPageText[],
  chunkSize = DEFAULT_CHUNK_CHAR_SIZE,
  overlap = DEFAULT_CHUNK_OVERLAP
): DocumentChunk[] {
  const chunks: DocumentChunk[] = [];

  for (const page of pages) {
    const text = page.text.trim();
    if (!text) continue;

    let chunkIndex = 0;
    let start = 0;

    while (start < text.length) {
      const end = Math.min(start + chunkSize, text.length);
      const content = text.slice(start, end).trim();

      if (content) {
        chunks.push({
          content,
          pageNumber: page.pageNumber,
          chunkIndex,
          charStart: start,
          charEnd: end
        });
      }

      if (end === text.length) break;

      start = Math.max(end - overlap, start + 1);
      chunkIndex += 1;
    }
  }

  return chunks;
}
