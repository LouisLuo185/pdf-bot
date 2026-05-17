import {
  resolveChatProviderConfig,
  resolveEmbeddingProviderConfig
} from "../../lib/ai-provider.ts";
import type { AppEnv } from "../../lib/env.ts";
import type { UnitTestCase } from "./helpers.ts";
import { assert } from "./helpers.ts";

function createEnv(overrides: Partial<AppEnv> = {}): AppEnv {
  return {
    NODE_ENV: "test",
    NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
    SUPABASE_SERVICE_ROLE_KEY: "service-role-key",
    SUPABASE_STORAGE_BUCKET: "pdf-files",
    AI_PROVIDER: "openai",
    AI_CHAT_PROVIDER: "openai",
    AI_EMBEDDING_PROVIDER: "openai",
    AI_CHAT_MODEL: "gpt-4o-mini",
    AI_EMBEDDING_MODEL: "text-embedding-3-small",
    OPENAI_API_KEY: "openai-key",
    ZHIPU_API_KEY: "zhipu-key",
    DEEPSEEK_API_KEY: "deepseek-key",
    DASHSCOPE_API_KEY: "dashscope-key",
    ANTHROPIC_API_KEY: undefined,
    GOOGLE_GENERATIVE_AI_API_KEY: undefined,
    OPENROUTER_API_KEY: undefined,
    ...overrides
  };
}

export const aiProviderTests: UnitTestCase[] = [
  {
    name: "resolveChatProviderConfig returns the selected chat provider config",
    run() {
      const config = resolveChatProviderConfig(createEnv());

      assert.deepEqual(config, {
        provider: "openai",
        model: "gpt-4o-mini",
        apiKey: "openai-key",
        baseUrl: "https://api.openai.com/v1"
      });
    }
  },
  {
    name: "resolveEmbeddingProviderConfig returns the selected embedding provider config",
    run() {
      const config = resolveEmbeddingProviderConfig(
        createEnv({
          AI_EMBEDDING_PROVIDER: "openai"
        })
      );

      assert.equal(config.provider, "openai");
      assert.equal(config.model, "text-embedding-3-small");
      assert.equal(config.baseUrl, "https://api.openai.com/v1");
    }
  },
  {
    name: "resolveChatProviderConfig supports split provider setups",
    run() {
      const config = resolveChatProviderConfig(
        createEnv({
          AI_CHAT_PROVIDER: "anthropic",
          ANTHROPIC_API_KEY: "anthropic-key"
        })
      );

      assert.equal(config.provider, "anthropic");
      assert.equal(config.apiKey, "anthropic-key");
      assert.equal(config.baseUrl, "https://api.openai.com/v1");
    }
  },
  {
    name: "resolveChatProviderConfig supports deepseek defaults",
    run() {
      const config = resolveChatProviderConfig(
        createEnv({
          AI_PROVIDER: "deepseek",
          AI_CHAT_PROVIDER: "deepseek",
          AI_CHAT_MODEL: "deepseek-chat"
        })
      );

      assert.equal(config.provider, "deepseek");
      assert.equal(config.baseUrl, "https://api.deepseek.com");
      assert.equal(config.apiKey, "deepseek-key");
    }
  },
  {
    name: "resolveChatProviderConfig supports zhipu defaults",
    run() {
      const config = resolveChatProviderConfig(
        createEnv({
          AI_PROVIDER: "zhipu",
          AI_CHAT_PROVIDER: "zhipu",
          AI_CHAT_MODEL: "glm-4.7-flash"
        })
      );

      assert.equal(config.provider, "zhipu");
      assert.equal(config.baseUrl, "https://open.bigmodel.cn/api/paas/v4");
      assert.equal(config.apiKey, "zhipu-key");
    }
  },
  {
    name: "resolveEmbeddingProviderConfig supports dashscope defaults",
    run() {
      const config = resolveEmbeddingProviderConfig(
        createEnv({
          AI_PROVIDER: "dashscope",
          AI_EMBEDDING_PROVIDER: "dashscope",
          AI_EMBEDDING_MODEL: "text-embedding-v4"
        })
      );

      assert.equal(config.provider, "dashscope");
      assert.equal(config.baseUrl, "https://dashscope.aliyuncs.com/compatible-mode/v1");
      assert.equal(config.apiKey, "dashscope-key");
    }
  },
  {
    name: "resolveEmbeddingProviderConfig throws when the selected provider has no key",
    run() {
      assert.throws(
        () =>
          resolveEmbeddingProviderConfig(
            createEnv({
              AI_EMBEDDING_PROVIDER: "openrouter",
              OPENROUTER_API_KEY: undefined
            })
          ),
        /API key missing for provider "openrouter"/
      );
    }
  }
];
