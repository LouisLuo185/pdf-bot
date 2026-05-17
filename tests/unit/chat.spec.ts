import { generateRagAnswer } from "../../lib/llm.ts";
import type { UnitTestCase } from "./helpers.ts";
import { assert } from "./helpers.ts";

export const chatTests: UnitTestCase[] = [
  {
    name: "generateRagAnswer rejects empty questions",
    async run() {
      await assert.rejects(
        () =>
          generateRagAnswer({
            question: "   ",
            contextText: "Some retrieved context"
          }),
        /question is required/i
      );
    }
  },
  {
    name: "generateRagAnswer returns a grounded fallback when no context exists",
    async run() {
      const answer = await generateRagAnswer({
        question: "What is the main contribution?",
        contextText: "   "
      });

      assert.equal(
        answer,
        "I could not find relevant content in this PDF to answer that question."
      );
    }
  }
];
