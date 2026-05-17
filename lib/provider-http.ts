const REQUEST_TIMEOUT_MS = 30000;

export function buildProviderUrl(baseUrl: string, path: string): string {
  return `${baseUrl.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;
}

export function formatProviderNetworkError(
  stage: string,
  error: unknown
): Error {
  const message =
    error instanceof Error ? error.message : "Unknown network error.";

  if (/timed?out/i.test(message) || /connect timeout/i.test(message)) {
    return new Error(
      `${stage} failed: network timeout while contacting the AI provider. Check your network or provider base URL.`
    );
  }

  if (/fetch failed/i.test(message)) {
    return new Error(
      `${stage} failed: could not reach the AI provider. Check your network or provider base URL.`
    );
  }

  return new Error(`${stage} failed: ${message}`);
}

export async function fetchWithTimeout(
  input: RequestInfo | URL,
  init: RequestInit = {},
  timeoutMs = REQUEST_TIMEOUT_MS
): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(input, {
      ...init,
      signal: controller.signal
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("Request timed out.");
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}
