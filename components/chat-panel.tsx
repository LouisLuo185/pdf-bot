"use client";

import { useState } from "react";
import type { ChatMessage } from "@/types/chat";
import type { DocumentRecord } from "@/types/document";
import type { SourceChunk } from "@/types/source";
import { MessageInput } from "@/components/message-input";
import { MessageList } from "@/components/message-list";
import { SourceCard } from "@/components/source-card";

type ChatPanelProps = {
  documentId: string;
  document: DocumentRecord | null;
};

export function ChatPanel({ documentId, document }: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sources, setSources] = useState<SourceChunk[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const isDocumentReady = document?.status === "ready";
  const isDocumentMissing = !document;

  function getStatusMessage() {
    if (isDocumentMissing) {
      return "This document could not be found.";
    }

    if (document.status === "failed") {
      return "Document processing failed. Please upload the PDF again after checking the file.";
    }

    if (document.status !== "ready") {
      return "This document is still processing. Chat will unlock when summary and embeddings finish.";
    }

    return null;
  }

  const statusMessage = getStatusMessage();

  async function handleSend(content: string) {
    if (!isDocumentReady) {
      setMessages([
        ...messages,
        {
          role: "assistant",
          content:
            statusMessage ??
            "This document is not ready for chat yet."
        }
      ]);
      return;
    }

    const nextMessages: ChatMessage[] = [...messages, { role: "user", content }];
    setMessages(nextMessages);
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          documentId,
          messages: nextMessages
        })
      });

      const payload = (await response.json()) as {
        answer?: string;
        sources?: SourceChunk[];
        error?: string;
      };

      if (!response.ok) {
        throw new Error(payload.error ?? "Failed to generate answer.");
      }

      setMessages([
        ...nextMessages,
        { role: "assistant", content: payload.answer ?? "" }
      ]);
      setSources(payload.sources ?? []);
    } catch (error) {
      setMessages([
        ...nextMessages,
        {
          role: "assistant",
          content: error instanceof Error ? error.message : "Failed to generate answer."
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="flex min-h-[80vh] flex-col rounded-[28px] border border-border bg-panel shadow-panel">
      <div className="border-b border-border px-6 py-5">
        <h2 className="text-xl font-semibold">Ask the document</h2>
        <p className="mt-1 text-sm text-foreground/65">
          Retrieval-backed answers and source citations will appear here.
        </p>
        {statusMessage ? (
          <p className="mt-3 rounded-2xl bg-background px-4 py-3 text-sm leading-6 text-foreground/70">
            {statusMessage}
          </p>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-6 p-6">
        <MessageList isLoading={isLoading} messages={messages} />

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_280px]">
          <MessageInput disabled={isLoading || !isDocumentReady} onSend={handleSend} />

          <div className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-foreground/55">
              Sources
            </p>
            {sources.length ? (
              sources.map((source) => <SourceCard key={source.id} source={source} />)
            ) : (
              <div className="rounded-2xl bg-background px-4 py-3 text-sm text-foreground/60">
                {isDocumentReady
                  ? "Source citations for the latest answer will show up here."
                  : "Citations will appear after the document finishes processing and you send a question."}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
