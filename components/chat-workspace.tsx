"use client";

import { useEffect, useState } from "react";
import { ChatPanel } from "@/components/chat-panel";
import { DocumentSummary } from "@/components/document-summary";
import type { DocumentRecord } from "@/types/document";

type ChatWorkspaceProps = {
  documentId: string;
  initialDocument: DocumentRecord | null;
};

const POLL_INTERVAL_MS = 3000;

export function ChatWorkspace({
  documentId,
  initialDocument
}: ChatWorkspaceProps) {
  const [document, setDocument] = useState<DocumentRecord | null>(initialDocument);

  useEffect(() => {
    if (!document || document.status === "ready" || document.status === "failed") {
      return;
    }

    let cancelled = false;

    async function pollDocument() {
      try {
        const response = await fetch(`/api/documents/${documentId}`, {
          cache: "no-store"
        });

        if (!response.ok) return;
        const payload = (await response.json()) as { document?: DocumentRecord };

        if (!cancelled && payload.document) {
          setDocument(payload.document);
        }
      } catch {
        // Ignore polling errors and retry on the next interval.
      }
    }

    pollDocument();
    const interval = window.setInterval(pollDocument, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [document, documentId]);

  return (
    <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
      <DocumentSummary document={document} />
      <ChatPanel document={document} documentId={documentId} />
    </div>
  );
}
