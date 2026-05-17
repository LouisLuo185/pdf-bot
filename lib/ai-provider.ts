import type { AiProvider, AppEnv } from "./env.ts";
import { getEnv } from "./env.ts";

export type ProviderConfig = {
  provider: AiProvider;
  model: string;
  apiKey: string;
  baseUrl: string;
};

function resolveBaseUrl(
  provider: AiProvider,
  explicitBaseUrl?: string
): string {
  if (explicitBaseUrl) {
    return explicitBaseUrl.replace(/\/+$/, "");
  }

  switch (provider) {
    case "openai":
      return "https://api.openai.com/v1";
    case "zhipu":
      return "https://open.bigmodel.cn/api/paas/v4";
    case "deepseek":
      return "https://api.deepseek.com";
    case "dashscope":
      return "https://dashscope.aliyuncs.com/compatible-mode/v1";
    default:
      return "https://api.openai.com/v1";
  }
}

function resolveApiKey(env: AppEnv, provider: AiProvider): string {
  const apiKeys: Record<AiProvider, string | undefined> = {
    openai: env.OPENAI_API_KEY,
    zhipu: env.ZHIPU_API_KEY,
    deepseek: env.DEEPSEEK_API_KEY,
    dashscope: env.DASHSCOPE_API_KEY,
    anthropic: env.ANTHROPIC_API_KEY,
    google: env.GOOGLE_GENERATIVE_AI_API_KEY,
    openrouter: env.OPENROUTER_API_KEY
  };

  const apiKey = apiKeys[provider];

  if (!apiKey) {
    throw new Error(`API key missing for provider "${provider}".`);
  }

  return apiKey;
}

export function resolveChatProviderConfig(env: AppEnv): ProviderConfig {
  const provider = env.AI_CHAT_PROVIDER ?? env.AI_PROVIDER;

  return {
    provider,
    model: env.AI_CHAT_MODEL,
    apiKey: resolveApiKey(env, provider),
    baseUrl: resolveBaseUrl(provider, env.AI_CHAT_BASE_URL)
  };
}

export function resolveEmbeddingProviderConfig(env: AppEnv): ProviderConfig {
  const provider = env.AI_EMBEDDING_PROVIDER ?? env.AI_PROVIDER;

  return {
    provider,
    model: env.AI_EMBEDDING_MODEL,
    apiKey: resolveApiKey(env, provider),
    baseUrl: resolveBaseUrl(provider, env.AI_EMBEDDING_BASE_URL)
  };
}

export function getProviderConfig(): ProviderConfig {
  return resolveChatProviderConfig(getEnv());
}

export function getChatProviderConfig(): ProviderConfig {
  return resolveChatProviderConfig(getEnv());
}

export function getEmbeddingProviderConfig(): ProviderConfig {
  return resolveEmbeddingProviderConfig(getEnv());
}
