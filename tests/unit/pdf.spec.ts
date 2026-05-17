import { hasMeaningfulPdfText, normalizePdfPageText } from "../../lib/pdf.ts";
import type { UnitTestCase } from "./helpers.ts";
import { assert } from "./helpers.ts";

export const pdfTests: UnitTestCase[] = [
  {
    name: "normalizePdfPageText removes noisy spacing while keeping paragraph breaks",
    run() {
      const normalized = normalizePdfPageText("Hello   world\r\n\r\n\r\nThis\t\tis  a test");

      assert.equal(normalized, "Hello world\n\nThis is a test");
    }
  },
  {
    name: "hasMeaningfulPdfText detects text pages",
    run() {
      assert.equal(hasMeaningfulPdfText("A real sentence on the page."), true);
      assert.equal(hasMeaningfulPdfText(" \n \t "), false);
    }
  }
];
