import {
  buildContextText,
  dedupeSources,
  formatSourceLabel,
  hasUsableRagContext,
  renderSourceBlock
} from "../../lib/rag.ts";
import type { SourceChunk } from "../../types/source.ts";
import type { UnitTestCase } from "./helpers.ts";
import { assert } from "./helpers.ts";

function createSource(overrides: Partial<SourceChunk> = {}): SourceChunk {
  return {
    id: "chunk-1",
    documentId: "doc-1",
    content: "This is a retrieved chunk from the PDF.",
    pageNumber: 2,
    chunkIndex: 0,
    excerpt: "This is a retrieved chunk from the PDF.",
    similarity: 0.9,
    ...overrides
  };
}

export const ragTests: UnitTestCase[] = [
  {
    name: "formatSourceLabel builds a stable citation label",
    run() {
      const label = formatSourceLabel(createSource(), 0);

      assert.equal(label, "Source 1: Page 2, Chunk 0");
    }
  },
  {
    name: "renderSourceBlock includes label and source content",
    run() {
      const block = renderSourceBlock(createSource(), 1);

      assert.equal(
        block,
        "[Source 2: Page 2, Chunk 0]\nThis is a retrieved chunk from the PDF."
      );
    }
  },
  {
    name: "dedupeSources removes repeated page and chunk hits",
    run() {
      const sources = dedupeSources([
        createSource({ id: "a" }),
        createSource({ id: "b" }),
        createSource({ id: "c", chunkIndex: 1 })
      ]);

      assert.equal(sources.length, 2);
      assert.deepEqual(
        sources.map((source) => source.chunkIndex),
        [0, 1]
      );
    }
  },
  {
    name: "buildContextText joins multiple source blocks and respects maxChars",
    run() {
      const text = buildContextText(
        [
          createSource({ id: "a", content: "Alpha source content." }),
          createSource({ id: "b", chunkIndex: 1, content: "Beta source content." })
        ],
        80
      );

      assert.equal(text.includes("Alpha source content."), true);
      assert.equal(text.includes("Beta source content."), false);
    }
  },
  {
    name: "hasUsableRagContext ignores empty source content",
    run() {
      assert.equal(hasUsableRagContext([createSource({ content: "   " })]), false);
      assert.equal(hasUsableRagContext([createSource()]), true);
    }
  }
];
