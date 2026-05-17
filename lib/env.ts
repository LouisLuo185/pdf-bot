import { z } from "zod";

const providerSchema = z.enum([
  "openai",
  "zhipu",
  "deepseek",
  "dashscope",
  "anthropic",
  "google",
  "openrouter"
]);

export const envSchema = z
  .object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
    SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
    SUPABASE_STORAGE_BUCKET: z.string().min(1).default("pdf-files"),
    AI_PROVIDER: providerSchema.default("openai"),
    AI_CHAT_PROVIDER: providerSchema.optional(),
    AI_EMBEDDING_PROVIDER: providerSchema.optional(),
    AI_CHAT_BASE_URL: z.string().url().optional(),
    AI_EMBEDDING_BASE_URL: z.string().url().optional(),
    AI_CHAT_MODEL: z.string().min(1).default("gpt-4o-mini"),
    AI_EMBEDDING_MODEL: z.string().min(1).default("text-embedding-3-small"),
    OPENAI_API_KEY: z.string().optional(),
    ZHIPU_API_KEY: z.string().optional(),
    DEEPSEEK_API_KEY: z.string().optional(),
    DASHSCOPE_API_KEY: z.string().optional(),
    ANTHROPIC_API_KEY: z.string().optional(),
    GOOGLE_GENERATIVE_AI_API_KEY: z.string().optional(),
    OPENROUTER_API_KEY: z.string().optional()
  })
  .superRefine((env, context) => {
    const providerKeyMap: Record<AiProvider, string | undefined> = {
      openai: env.OPENAI_API_KEY,
      zhipu: env.ZHIPU_API_KEY,
      deepseek: env.DEEPSEEK_API_KEY,
      dashscope: env.DASHSCOPE_API_KEY,
      anthropic: env.ANTHROPIC_API_KEY,
      google: env.GOOGLE_GENERATIVE_AI_API_KEY,
      openrouter: env.OPENROUTER_API_KEY
    };

    const chatProvider = env.AI_CHAT_PROVIDER ?? env.AI_PROVIDER;
    const embeddingProvider = env.AI_EMBEDDING_PROVIDER ?? env.AI_PROVIDER;

    for (const provider of new Set([chatProvider, embeddingProvider])) {
      if (!providerKeyMap[provider]) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: [`${provider.toUpperCase()}_API_KEY`],
          message: `Missing API key for provider "${provider}".`
        });
      }
    }
  });

export type AiProvider = z.infer<typeof providerSchema>;
export type AppEnv = z.infer<typeof envSchema>;

export function parseEnv(
  source: Partial<Record<string, string | undefined>> = process.env
): AppEnv {
  const parsed = envSchema.safeParse({
    NODE_ENV: source.NODE_ENV,
    NEXT_PUBLIC_SUPABASE_URL: source.NEXT_PUBLIC_SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: source.SUPABASE_SERVICE_ROLE_KEY,
    SUPABASE_STORAGE_BUCKET: source.SUPABASE_STORAGE_BUCKET,
    AI_PROVIDER: source.AI_PROVIDER,
    AI_CHAT_PROVIDER: source.AI_CHAT_PROVIDER,
    AI_EMBEDDING_PROVIDER: source.AI_EMBEDDING_PROVIDER,
    AI_CHAT_BASE_URL: source.AI_CHAT_BASE_URL,
    AI_EMBEDDING_BASE_URL: source.AI_EMBEDDING_BASE_URL,
    AI_CHAT_MODEL: source.AI_CHAT_MODEL,
    AI_EMBEDDING_MODEL: source.AI_EMBEDDING_MODEL,
    OPENAI_API_KEY: source.OPENAI_API_KEY,
    ZHIPU_API_KEY: source.ZHIPU_API_KEY,
    DEEPSEEK_API_KEY: source.DEEPSEEK_API_KEY,
    DASHSCOPE_API_KEY: source.DASHSCOPE_API_KEY,
    ANTHROPIC_API_KEY: source.ANTHROPIC_API_KEY,
    GOOGLE_GENERATIVE_AI_API_KEY: source.GOOGLE_GENERATIVE_AI_API_KEY,
    OPENROUTER_API_KEY: source.OPENROUTER_API_KEY
  });

  if (!parsed.success) {
    throw new Error(
      `Invalid environment configuration: ${parsed.error.issues
        .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
        .join("; ")}`
    );
  }

  return parsed.data;
}

let cachedEnv: AppEnv | null = null;

export function getEnv(): AppEnv {
  if (!cachedEnv) {
    cachedEnv = parseEnv();
  }

  return cachedEnv;
}

export function resetEnvCache() {
  cachedEnv = null;
}
