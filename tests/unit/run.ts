import { aiProviderTests } from "./ai-provider.spec.ts";
import { chatTests } from "./chat.spec.ts";
import { chunkTests } from "./chunk.spec.ts";
import { dbTests } from "./db.spec.ts";
import { embeddingTests } from "./embedding.spec.ts";
import { envTests } from "./env.spec.ts";
import type { UnitTestCase } from "./helpers.ts";
import { llmTests } from "./llm.spec.ts";
import { pdfTests } from "./pdf.spec.ts";
import { providerHttpTests } from "./provider-http.spec.ts";
import { ragTests } from "./rag.spec.ts";
import { storageTests } from "./storage.spec.ts";
import { uploadTests } from "./upload.spec.ts";
import { validatorTests } from "./validators.spec.ts";

const allTests: UnitTestCase[] = [
  ...validatorTests,
  ...chatTests,
  ...chunkTests,
  ...dbTests,
  ...embeddingTests,
  ...envTests,
  ...llmTests,
  ...pdfTests,
  ...providerHttpTests,
  ...ragTests,
  ...aiProviderTests,
  ...storageTests,
  ...uploadTests
];

async function main() {
  let passed = 0;

  for (const testCase of allTests) {
    try {
      await testCase.run();
      passed += 1;
      console.log(`PASS ${testCase.name}`);
    } catch (error) {
      console.error(`FAIL ${testCase.name}`);
      throw error;
    }
  }

  console.log(`\n${passed}/${allTests.length} unit tests passed.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
