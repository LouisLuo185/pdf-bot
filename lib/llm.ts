import { getChatProviderConfig } from "./ai-provider.ts";
import {
  buildProviderUrl,
  fetchWithTimeout,
  formatProviderNetworkError
} from "./provider-http.ts";
import { QA_SYSTEM_PROMPT, SUMMARY_PROMPT } from "./prompts.ts";

export type DocumentSummaryResult = {
  summary: string;
  keyConcepts: string[];
  suggestedQuestions: string[];
};

export type RagAnswerInput = {
  question: string;
  contextText: string;
};

type OpenAiChatResponse = {
  choices?: Array<{
    message?: {
      content?: string | null;
    };
  }>;
};

const SUMMARY_MAX_CHARS = 12000;
const SUMMARY_MAX_CHUNKS = 8;
const OPENAI_COMPATIBLE_CHAT_PROVIDERS = new Set([
  "openai",
  "zhipu",
  "deepseek",
  "dashscope",
  "openrouter"
]);

export function buildSummarySourceText(chunks: string[]): string {
  const excerpt = chunks
    .filter((chunk) => chunk.trim().length > 0)
    .slice(0, SUMMARY_MAX_CHUNKS)
    .join("\n\n---\n\n")
    .slice(0, SUMMARY_MAX_CHARS);

  return excerpt.trim();
}

function normalizeList(value: unknown, count: number): string[] {
  if (!Array.isArray(value)) return [];

  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, count);
}

export function parseSummaryPayload(content: string): DocumentSummaryResult {
  let parsed: unknown;

  try {
    parsed = JSON.parse(extractJsonObject(content));
  } catch {
    throw new Error("Summary model returned invalid JSON.");
  }

  if (!parsed || typeof parsed !== "object") {
    throw new Error("Summary model returned an invalid payload.");
  }

  const record = parsed as Record<string, unknown>;
  const summary =
    typeof record.summary === "string" ? record.summary.trim() : "";
  const keyConcepts = normalizeList(record.keyConcepts, 5);
  const suggestedQuestions = normalizeList(record.suggestedQuestions, 5);

  if (!summary) {
    throw new Error("Summary model did not return a usable summary.");
  }

  return {
    summary,
    keyConcepts,
    suggestedQuestions
  };
}

export function extractJsonObject(content: string): string {
  const trimmed = content.trim();

  if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
    return trimmed;
  }

  const fencedMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fencedMatch?.[1]) {
    return fencedMatch[1].trim();
  }

  const firstBrace = trimmed.indexOf("{");
  const lastBrace = trimmed.lastIndexOf("}");
  if (firstBrace >= 0 && lastBrace > firstBrace) {
    return trimmed.slice(firstBrace, lastBrace + 1).trim();
  }

  return trimmed;
}

function assertOpenAiCompatibleChatProvider(provider: string) {
  if (!OPENAI_COMPATIBLE_CHAT_PROVIDERS.has(provider)) {
    throw new Error(
      `Chat provider "${provider}" is not implemented for chat generation yet. Use openai, zhipu, deepseek, dashscope, or openrouter.`
    );
  }
}

async function requestSummary(documentText: string): Promise<string> {
  const config = getChatProviderConfig();
  assertOpenAiCompatibleChatProvider(config.provider);

  const body: Record<string, unknown> = {
    model: config.model,
    temperature: 0.2,
    messages: [
      {
        role: "system",
        content: SUMMARY_PROMPT
      },
      {
        role: "user",
        content: `Document excerpts:\n${documentText}`
      }
    ]
  };

  if (config.provider === "openai" || config.provider === "openrouter") {
    body.response_format = { type: "json_object" };
  }

  let response: Response;
  try {
    response = await fetchWithTimeout(buildProviderUrl(config.baseUrl, "/chat/completions"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.apiKey}`
      },
      body: JSON.stringify(body)
    });
  } catch (error) {
    throw formatProviderNetworkError("Summary provider request", error);
  }

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Summary request failed: ${response.status} ${message}`);
  }

  const payload = (await response.json()) as OpenAiChatResponse;
  const content = payload.choices?.[0]?.message?.content?.trim();

  if (!content) {
    throw new Error("Summary model returned an empty response.");
  }

  return content;
}

async function requestChatAnswer(input: RagAnswerInput): Promise<string> {
  const config = getChatProviderConfig();
  assertOpenAiCompatibleChatProvider(config.provider);

  let response: Response;
  try {
    response = await fetchWithTimeout(buildProviderUrl(config.baseUrl, "/chat/completions"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.apiKey}`
      },
      body: JSON.stringify({
        model: config.model,
        temperature: 0.2,
        messages: [
          {
            role: "system",
            content: QA_SYSTEM_PROMPT
          },
          {
            role: "user",
            content: `PDF Context:\n${input.contextText}\n\nUser Question:\n${input.question}`
          }
        ]
      })
    });
  } catch (error) {
    throw formatProviderNetworkError("Chat provider request", error);
  }

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`QA request failed: ${response.status} ${message}`);
  }

  const payload = (await response.json()) as OpenAiChatResponse;
  const content = payload.choices?.[0]?.message?.content?.trim();

  if (!content) {
    throw new Error("QA model returned an empty response.");
  }

  return content;
}

export async function generateDocumentSummary(
  chunks: string[]
): Promise<DocumentSummaryResult> {
  const documentText = buildSummarySourceText(chunks);

  if (!documentText) {
    throw new Error("No text was available for summary generation.");
  }

  const content = await requestSummary(documentText);
  return parseSummaryPayload(content);
}

export async function generateRagAnswer(
  input: RagAnswerInput
): Promise<string> {
  const question = input.question.trim();
  const contextText = input.contextText.trim();

  if (!question) {
    throw new Error("A question is required for answer generation.");
  }

  if (!contextText) {
    return "I could not find relevant content in this PDF to answer that question.";
  }

  return requestChatAnswer({
    question,
    contextText
  });
}
