import { MAX_PDF_BYTES } from "../../lib/constants.ts";
import { chatRequestSchema, validatePdfUpload } from "../../lib/validators.ts";
import type { UnitTestCase } from "./helpers.ts";
import { assert } from "./helpers.ts";

export const validatorTests: UnitTestCase[] = [
  {
    name: "validatePdfUpload rejects a missing file",
    run() {
      const result = validatePdfUpload(null);

      assert.deepEqual(result, {
        success: false,
        error: "Please choose a PDF file."
      });
    }
  },
  {
    name: "validatePdfUpload rejects a non-pdf file",
    run() {
      const file = new File(["hello"], "notes.txt", {
        type: "text/plain"
      });

      const result = validatePdfUpload(file);

      assert.deepEqual(result, {
        success: false,
        error: "Only PDF files are supported."
      });
    }
  },
  {
    name: "validatePdfUpload rejects a pdf larger than the MVP limit",
    run() {
      const file = new File(["a".repeat(MAX_PDF_BYTES + 1)], "large.pdf", {
        type: "application/pdf"
      });

      const result = validatePdfUpload(file);

      assert.deepEqual(result, {
        success: false,
        error: "PDF exceeds the 10 MB MVP limit."
      });
    }
  },
  {
    name: "validatePdfUpload accepts a valid pdf upload",
    run() {
      const file = new File(["pdf"], "paper.pdf", {
        type: "application/pdf"
      });

      const result = validatePdfUpload(file);

      assert.equal(result.success, true);
      if (result.success) {
        assert.equal(result.file.name, "paper.pdf");
      }
    }
  },
  {
    name: "chatRequestSchema accepts a valid chat payload",
    run() {
      const payload = {
        documentId: "123e4567-e89b-12d3-a456-426614174000",
        messages: [{ role: "user", content: "Summarize this document." }]
      };

      const result = chatRequestSchema.safeParse(payload);

      assert.equal(result.success, true);
    }
  },
  {
    name: "chatRequestSchema rejects invalid document ids and empty messages",
    run() {
      const payload = {
        documentId: "not-a-uuid",
        messages: [{ role: "user", content: "" }]
      };

      const result = chatRequestSchema.safeParse(payload);

      assert.equal(result.success, false);
    }
  }
];
