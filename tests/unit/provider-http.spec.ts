import {
  buildProviderUrl,
  formatProviderNetworkError
} from "../../lib/provider-http.ts";
import type { UnitTestCase } from "./helpers.ts";
import { assert } from "./helpers.ts";

export const providerHttpTests: UnitTestCase[] = [
  {
    name: "buildProviderUrl joins base urls and paths safely",
    run() {
      assert.equal(
        buildProviderUrl("https://api.openai.com/v1/", "/chat/completions"),
        "https://api.openai.com/v1/chat/completions"
      );
    }
  },
  {
    name: "formatProviderNetworkError turns timeout errors into actionable messages",
    run() {
      const error = formatProviderNetworkError(
        "Embedding provider request",
        new Error("Connect Timeout Error")
      );

      assert.equal(
        error.message,
        "Embedding provider request failed: network timeout while contacting the AI provider. Check your network or provider base URL."
      );
    }
  },
  {
    name: "formatProviderNetworkError turns fetch failures into actionable messages",
    run() {
      const error = formatProviderNetworkError(
        "Chat provider request",
        new Error("fetch failed")
      );

      assert.equal(
        error.message,
        "Chat provider request failed: could not reach the AI provider. Check your network or provider base URL."
      );
    }
  }
];
