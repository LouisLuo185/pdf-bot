import {
  buildSummarySourceText,
  extractJsonObject,
  parseSummaryPayload
} from "../../lib/llm.ts";
import type { UnitTestCase } from "./helpers.ts";
import { assert } from "./helpers.ts";

export const llmTests: UnitTestCase[] = [
  {
    name: "buildSummarySourceText keeps only the first few chunks and trims output",
    run() {
      const text = buildSummarySourceText([
        "Chunk 1",
        "Chunk 2",
        "Chunk 3",
        "Chunk 4",
        "Chunk 5",
        "Chunk 6",
        "Chunk 7",
        "Chunk 8",
        "Chunk 9"
      ]);

      assert.equal(text.includes("Chunk 9"), false);
      assert.equal(text.includes("Chunk 8"), true);
    }
  },
  {
    name: "parseSummaryPayload extracts structured summary fields",
    run() {
      const result = parseSummaryPayload(
        JSON.stringify({
          summary: "This paper introduces a retrieval workflow.",
          keyConcepts: ["RAG", "Chunking", "Embeddings", "Citations", "Summary"],
          suggestedQuestions: [
            "What is the main contribution?",
            "How are chunks created?",
            "Why are citations useful?",
            "What are the limitations?",
            "How does retrieval work?"
          ]
        })
      );

      assert.equal(result.summary, "This paper introduces a retrieval workflow.");
      assert.equal(result.keyConcepts.length, 5);
      assert.equal(result.suggestedQuestions.length, 5);
    }
  },
  {
    name: "parseSummaryPayload rejects invalid JSON payloads",
    run() {
      assert.throws(
        () => parseSummaryPayload("not-json"),
        /invalid JSON/i
      );
    }
  },
  {
    name: "extractJsonObject unwraps fenced json payloads",
    run() {
      const json = extractJsonObject(
        '```json\n{"summary":"A","keyConcepts":[],"suggestedQuestions":[]}\n```'
      );

      assert.equal(
        json,
        '{"summary":"A","keyConcepts":[],"suggestedQuestions":[]}'
      );
    }
  },
  {
    name: "parseSummaryPayload accepts json wrapped in markdown fences",
    run() {
      const result = parseSummaryPayload(
        '```json\n{"summary":"A short summary","keyConcepts":["One"],"suggestedQuestions":["What next?"]}\n```'
      );

      assert.equal(result.summary, "A short summary");
      assert.equal(result.keyConcepts[0], "One");
      assert.equal(result.suggestedQuestions[0], "What next?");
    }
  }
];
