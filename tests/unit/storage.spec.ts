import { buildDocumentStoragePath } from "../../lib/storage.ts";
import type { UnitTestCase } from "./helpers.ts";
import { assert } from "./helpers.ts";

export const storageTests: UnitTestCase[] = [
  {
    name: "buildDocumentStoragePath produces a stable sanitized path",
    run() {
      const path = buildDocumentStoragePath("doc-123", "My Research Paper (Final).PDF");

      assert.equal(path, "documents/doc-123/my-research-paper-final.pdf");
    }
  },
  {
    name: "buildDocumentStoragePath falls back to a safe default base name",
    run() {
      const path = buildDocumentStoragePath("doc-456", "   .pdf");

      assert.equal(path, "documents/doc-456/document.pdf");
    }
  }
];
