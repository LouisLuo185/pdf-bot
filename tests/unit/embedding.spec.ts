import { splitIntoBatches } from "../../lib/embedding.ts";
import type { UnitTestCase } from "./helpers.ts";
import { assert } from "./helpers.ts";

export const embeddingTests: UnitTestCase[] = [
  {
    name: "splitIntoBatches divides arrays into stable batches",
    run() {
      const batches = splitIntoBatches([1, 2, 3, 4, 5], 2);

      assert.deepEqual(batches, [[1, 2], [3, 4], [5]]);
    }
  },
  {
    name: "splitIntoBatches rejects invalid batch sizes",
    run() {
      assert.throws(
        () => splitIntoBatches([1, 2, 3], 0),
        /Batch size must be greater than zero/
      );
    }
  }
];
