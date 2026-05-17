import { DEFAULT_MATCH_COUNT } from "./constants.ts";
import { searchRelevantChunks } from "./vector.ts";
import type { SourceChunk } from "../types/source.ts";

const MAX_CONTEXT_CHARS = 12000;

export function formatSourceLabel(source: SourceChunk, index: number): string {
  const page = source.pageNumber ?? "?";
  return `Source ${index + 1}: Page ${page}, Chunk ${source.chunkIndex}`;
}

export function renderSourceBlock(source: SourceChunk, index: number): string {
  return `[${formatSourceLabel(source, index)}]\n${source.content.trim()}`;
}

export function dedupeSources(sources: SourceChunk[]): SourceChunk[] {
  const seen = new Set<string>();

  return sources.filter((source) => {
    const key = `${source.documentId}:${source.pageNumber ?? "?"}:${source.chunkIndex}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function buildContextText(
  sources: SourceChunk[],
  maxChars = MAX_CONTEXT_CHARS
): string {
  const blocks: string[] = [];
  let totalLength = 0;

  for (const [index, source] of sources.entries()) {
    const block = renderSourceBlock(source, index);
    const nextLength = totalLength + block.length + (blocks.length ? 4 : 0);

    if (nextLength > maxChars && blocks.length > 0) {
      break;
    }

    blocks.push(block);
    totalLength = nextLength;
  }

  return blocks.join("\n\n");
}

export function hasUsableRagContext(sources: SourceChunk[]): boolean {
  return sources.some((source) => source.content.trim().length > 0);
}

export async function buildRagContext(
  documentId: string,
  question: string,
  topK = DEFAULT_MATCH_COUNT
): Promise<{
  contextText: string;
  sources: SourceChunk[];
}> {
  const retrievedSources = await searchRelevantChunks(documentId, question, topK);
  const sources = dedupeSources(retrievedSources);

  if (!hasUsableRagContext(sources)) {
    return {
      contextText: "",
      sources: []
    };
  }

  return {
    contextText: buildContextText(sources),
    sources
  };
}
