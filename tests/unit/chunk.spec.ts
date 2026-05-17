import { chunkPdfPages } from "../../lib/chunk.ts";
import type { PdfPageText } from "../../types/document.ts";
import type { UnitTestCase } from "./helpers.ts";
import { assert } from "./helpers.ts";

export const chunkTests: UnitTestCase[] = [
  {
    name: "chunkPdfPages skips empty pages",
    run() {
      const pages: PdfPageText[] = [
        { pageNumber: 1, text: "   " },
        { pageNumber: 2, text: "\n\n" }
      ];

      const chunks = chunkPdfPages(pages, 10, 2);

      assert.deepEqual(chunks, []);
    }
  },
  {
    name: "chunkPdfPages keeps metadata for a single short page",
    run() {
      const pages: PdfPageText[] = [{ pageNumber: 3, text: "Hello PDF world" }];

      const chunks = chunkPdfPages(pages, 50, 5);

      assert.equal(chunks.length, 1);
      assert.deepEqual(chunks[0], {
        pageNumber: 3,
        chunkIndex: 0,
        content: "Hello PDF world",
        charStart: 0,
        charEnd: 15
      });
    }
  },
  {
    name: "chunkPdfPages splits long content into overlapping chunks",
    run() {
      const text = "abcdefghijklmnopqrstuvwxyz";
      const pages: PdfPageText[] = [{ pageNumber: 1, text }];

      const chunks = chunkPdfPages(pages, 10, 3);

      assert.equal(chunks.length, 4);
      assert.deepEqual(chunks.map((chunk) => chunk.content), [
        "abcdefghij",
        "hijklmnopq",
        "opqrstuvwx",
        "vwxyz"
      ]);
      assert.deepEqual(chunks.map((chunk) => chunk.chunkIndex), [0, 1, 2, 3]);
      assert.deepEqual(
        {
          charStart: chunks[1].charStart,
          charEnd: chunks[1].charEnd
        },
        {
          charStart: 7,
          charEnd: 17
        }
      );
    }
  },
  {
    name: "chunkPdfPages restarts chunk indexes for each page",
    run() {
      const pages: PdfPageText[] = [
        { pageNumber: 1, text: "abcdefghijklmno" },
        { pageNumber: 2, text: "pqrstuvwxyzabcd" }
      ];

      const chunks = chunkPdfPages(pages, 8, 2);

      assert.deepEqual(
        chunks.filter((chunk) => chunk.pageNumber === 1).map((chunk) => chunk.chunkIndex),
        [0, 1, 2]
      );
      assert.deepEqual(
        chunks.filter((chunk) => chunk.pageNumber === 2).map((chunk) => chunk.chunkIndex),
        [0, 1, 2]
      );
    }
  }
];
