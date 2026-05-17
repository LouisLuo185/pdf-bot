import {
  buildExcerpt,
  estimateTokenCount,
  mapChunkRowToSource,
  mapDocumentRow,
  toChunkInsertRows,
  toDocumentInsert,
  toDocumentUpdate
} from "../../lib/db.ts";
import type { UnitTestCase } from "./helpers.ts";
import { assert } from "./helpers.ts";

export const dbTests: UnitTestCase[] = [
  {
    name: "mapDocumentRow converts snake_case db rows into app records",
    run() {
      const document = mapDocumentRow({
        id: "doc-1",
        title: "Paper",
        file_name: "paper.pdf",
        storage_path: "documents/paper.pdf",
        summary: "summary",
        key_concepts: ["rag", "pdf"],
        suggested_questions: ["What is the main idea?"],
        status: "ready",
        error_message: null,
        page_count: 12,
        embedding_model: "text-embedding-3-small",
        chat_model: "gpt-4o-mini",
        created_at: "2026-01-01T00:00:00.000Z",
        updated_at: "2026-01-01T00:00:00.000Z"
      });

      assert.equal(document.fileName, "paper.pdf");
      assert.equal(document.storagePath, "documents/paper.pdf");
      assert.deepEqual(document.keyConcepts, ["rag", "pdf"]);
      assert.equal(document.embeddingModel, "text-embedding-3-small");
    }
  },
  {
    name: "toDocumentInsert creates the expected db payload",
    run() {
      const payload = toDocumentInsert({
        title: "Spec",
        fileName: "spec.pdf",
        storagePath: "docs/spec.pdf",
        embeddingModel: "embed-model",
        chatModel: "chat-model"
      });

      assert.deepEqual(payload, {
        title: "Spec",
        file_name: "spec.pdf",
        storage_path: "docs/spec.pdf",
        status: "queued",
        embedding_model: "embed-model",
        chat_model: "chat-model"
      });
    }
  },
  {
    name: "toDocumentUpdate only includes provided fields and updated_at",
    run() {
      const payload = toDocumentUpdate({
        status: "processing",
        errorMessage: null,
        pageCount: 5
      });

      assert.equal(payload.status, "processing");
      assert.equal(payload.error_message, null);
      assert.equal(payload.page_count, 5);
      assert.ok(typeof payload.updated_at === "string");
    }
  },
  {
    name: "toChunkInsertRows preserves chunk metadata and optional embeddings",
    run() {
      const rows = toChunkInsertRows(
        "doc-1",
        [
          {
            content: "hello world",
            pageNumber: 2,
            chunkIndex: 0,
            charStart: 0,
            charEnd: 11
          }
        ],
        [[0.1, 0.2, 0.3]]
      );

      assert.equal(rows.length, 1);
      assert.equal(rows[0].document_id, "doc-1");
      assert.equal(rows[0].token_count, estimateTokenCount("hello world"));
      assert.deepEqual(rows[0].embedding, [0.1, 0.2, 0.3]);
    }
  },
  {
    name: "buildExcerpt normalizes whitespace and truncates long content",
    run() {
      const excerpt = buildExcerpt(`Line 1\n\nLine   2\t\tLine 3`, 12);

      assert.equal(excerpt, "Line 1 Line...");
    }
  },
  {
    name: "mapChunkRowToSource enriches chunk rows with excerpt and similarity",
    run() {
      const source = mapChunkRowToSource({
        id: "chunk-1",
        document_id: "doc-1",
        content: "This is a chunk of source text used for testing.",
        page_number: 4,
        chunk_index: 2,
        char_start: 10,
        char_end: 40,
        similarity: 0.91
      });

      assert.equal(source.documentId, "doc-1");
      assert.equal(source.pageNumber, 4);
      assert.equal(source.chunkIndex, 2);
      assert.equal(source.similarity, 0.91);
      assert.ok(source.excerpt?.startsWith("This is a chunk"));
    }
  }
];
