import { getEmbeddingProviderConfig } from "./ai-provider.ts";
import {
  buildProviderUrl,
  fetchWithTimeout,
  formatProviderNetworkError
} from "./provider-http.ts";

const EMBEDDING_BATCH_SIZE = 20;

type OpenAiEmbeddingResponse = {
  data: Array<{
    embedding: number[];
    index: number;
  }>;
};

export function splitIntoBatches<T>(items: T[], batchSize: number): T[][] {
  if (batchSize <= 0) {
    throw new Error("Batch size must be greater than zero.");
  }

  const batches: T[][] = [];

  for (let start = 0; start < items.length; start += batchSize) {
    batches.push(items.slice(start, start + batchSize));
  }

  return batches;
}

async function requestEmbeddings(input: string[]): Promise<number[][]> {
  const config = getEmbeddingProviderConfig();

  if (!["openai", "zhipu", "deepseek", "dashscope"].includes(config.provider)) {
    throw new Error(
      `Embedding provider "${config.provider}" is not implemented yet. Use openai, zhipu, deepseek, or dashscope for now.`
    );
  }

  let response: Response;
  try {
    response = await fetchWithTimeout(buildProviderUrl(config.baseUrl, "/embeddings"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.apiKey}`
      },
      body: JSON.stringify({
        model: config.model,
        input
      })
    });
  } catch (error) {
    throw formatProviderNetworkError("Embedding provider request", error);
  }

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Embedding request failed: ${response.status} ${message}`);
  }

  const payload = (await response.json()) as OpenAiEmbeddingResponse;
  return payload.data
    .sort((a, b) => a.index - b.index)
    .map((item) => item.embedding);
}

export async function embedText(text: string): Promise<number[]> {
  const [embedding] = await embedMany([text]);

  if (!embedding) {
    throw new Error("No embedding was returned for the provided text.");
  }

  return embedding;
}

export async function embedMany(texts: string[]): Promise<number[][]> {
  const cleaned = texts.map((text) => text.trim()).filter(Boolean);

  if (!cleaned.length) {
    return [];
  }

  const batches = splitIntoBatches(cleaned, EMBEDDING_BATCH_SIZE);
  const embeddings: number[][] = [];

  for (const batch of batches) {
    embeddings.push(...(await requestEmbeddings(batch)));
  }

  return embeddings;
}
