import assert from "node:assert/strict";

export type UnitTestCase = {
  name: string;
  run: () => void | Promise<void>;
};

export { assert };
