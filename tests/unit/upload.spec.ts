import { deriveDocumentTitle } from "../../lib/upload.ts";
import type { UnitTestCase } from "./helpers.ts";
import { assert } from "./helpers.ts";

export const uploadTests: UnitTestCase[] = [
  {
    name: "deriveDocumentTitle removes the pdf extension",
    run() {
      assert.equal(deriveDocumentTitle("attention-is-all-you-need.pdf"), "attention-is-all-you-need");
    }
  },
  {
    name: "deriveDocumentTitle falls back when the file name becomes empty",
    run() {
      assert.equal(deriveDocumentTitle("   .pdf"), "Untitled document");
    }
  }
];
