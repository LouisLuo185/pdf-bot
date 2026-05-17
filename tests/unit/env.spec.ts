import { parseEnv } from "../../lib/env.ts";
import type { UnitTestCase } from "./helpers.ts";
import { assert } from "./helpers.ts";

const baseEnv = {
  NODE_ENV: "test",
  NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
  SUPABASE_SERVICE_ROLE_KEY: "service-role-key",
  SUPABASE_STORAGE_BUCKET: "pdf-files",
  AI_PROVIDER: "openai",
  AI_CHAT_PROVIDER: "openai",
  AI_EMBEDDING_PROVIDER: "openai",
  AI_CHAT_BASE_URL: "https://api.openai.com/v1",
  AI_EMBEDDING_BASE_URL: "https://api.openai.com/v1",
  AI_CHAT_MODEL: "gpt-4o-mini",
  AI_EMBEDDING_MODEL: "text-embedding-3-small",
  OPENAI_API_KEY: "openai-key",
  ZHIPU_API_KEY: "zhipu-key",
  DEEPSEEK_API_KEY: "deepseek-key",
  DASHSCOPE_API_KEY: "dashscope-key"
} as const;

export const envTests: UnitTestCase[] = [
  {
    name: "parseEnv accepts a valid openai configuration",
    run() {
      const env = parseEnv(baseEnv);

      assert.equal(env.AI_PROVIDER, "openai");
      assert.equal(env.AI_CHAT_MODEL, "gpt-4o-mini");
    }
  },
  {
    name: "parseEnv rejects missing provider credentials",
    run() {
      assert.throws(
        () =>
          parseEnv({
            ...baseEnv,
            OPENAI_API_KEY: undefined
          }),
        /Missing API key for provider "openai"/
      );
    }
  },
  {
    name: "parseEnv supports switching to anthropic",
    run() {
      const env = parseEnv({
        ...baseEnv,
        AI_CHAT_PROVIDER: "anthropic",
        AI_PROVIDER: "anthropic",
        AI_EMBEDDING_PROVIDER: "anthropic",
        ANTHROPIC_API_KEY: "anthropic-key",
        OPENAI_API_KEY: undefined
      });

      assert.equal(env.AI_PROVIDER, "anthropic");
    }
  },
  {
    name: "parseEnv supports deepseek and dashscope providers",
    run() {
      const env = parseEnv({
        ...baseEnv,
        AI_CHAT_PROVIDER: "dashscope",
        AI_EMBEDDING_PROVIDER: "deepseek"
      });

      assert.equal(env.AI_CHAT_PROVIDER, "dashscope");
      assert.equal(env.AI_EMBEDDING_PROVIDER, "deepseek");
    }
  },
  {
    name: "parseEnv supports zhipu provider",
    run() {
      const env = parseEnv({
        ...baseEnv,
        AI_PROVIDER: "zhipu",
        AI_CHAT_PROVIDER: "zhipu",
        AI_EMBEDDING_PROVIDER: "zhipu",
        AI_CHAT_BASE_URL: "https://open.bigmodel.cn/api/paas/v4",
        AI_EMBEDDING_BASE_URL: "https://open.bigmodel.cn/api/paas/v4"
      });

      assert.equal(env.AI_PROVIDER, "zhipu");
      assert.equal(env.AI_CHAT_PROVIDER, "zhipu");
      assert.equal(env.AI_EMBEDDING_PROVIDER, "zhipu");
    }
  },
  {
    name: "parseEnv defaults bucket and model settings when omitted",
    run() {
      const env = parseEnv({
        NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
        SUPABASE_SERVICE_ROLE_KEY: "service-role-key",
        OPENAI_API_KEY: "openai-key"
      });

      assert.equal(env.SUPABASE_STORAGE_BUCKET, "pdf-files");
      assert.equal(env.AI_PROVIDER, "openai");
      assert.equal(env.AI_EMBEDDING_PROVIDER, undefined);
      assert.equal(env.AI_CHAT_MODEL, "gpt-4o-mini");
      assert.equal(env.AI_EMBEDDING_MODEL, "text-embedding-3-small");
    }
  },
  {
    name: "parseEnv supports split chat and embedding providers",
    run() {
      const env = parseEnv({
        ...baseEnv,
        AI_CHAT_PROVIDER: "anthropic",
        ANTHROPIC_API_KEY: "anthropic-key"
      });

      assert.equal(env.AI_CHAT_PROVIDER, "anthropic");
      assert.equal(env.AI_EMBEDDING_PROVIDER, "openai");
      assert.equal(env.AI_CHAT_BASE_URL, "https://api.openai.com/v1");
    }
  }
];
