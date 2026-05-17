import type { DocumentRecord } from "@/types/document";

type DocumentSummaryProps = {
  document: DocumentRecord | null;
};

export function DocumentSummary({ document }: DocumentSummaryProps) {
  const statusLabel = document ? document.status : "missing";
  const statusHelp =
    !document
      ? "The document record could not be loaded."
      : document.status === "ready"
        ? "This document is ready for grounded chat."
        : document.status === "failed"
          ? "Processing stopped before the document became usable."
          : "The document is still being processed.";

  return (
    <aside className="rounded-[28px] border border-border bg-panel p-6 shadow-panel">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-foreground/60">Document Workspace</p>
        <span className="rounded-full bg-accentSoft px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-foreground/75">
          {statusLabel}
        </span>
      </div>
      <h1 className="mt-2 text-2xl font-semibold">
        {document?.title ?? "Processing document"}
      </h1>
      <p className="mt-2 text-sm leading-6 text-foreground/65">{statusHelp}</p>

      {document?.errorMessage ? (
        <p className="mt-3 rounded-2xl bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">
          {document.errorMessage}
        </p>
      ) : null}

      <section className="mt-8 space-y-6">
        <Block
          title="Brief"
          items={
            document?.summary
              ? [document.summary]
              : [
                  document?.status === "processing"
                    ? "The PDF has been uploaded and is waiting for text extraction, embedding, and summary generation."
                    : document?.status === "failed"
                      ? "Summary could not be generated because processing failed."
                      : "Document summary will appear after ingestion is implemented."
                ]
          }
        />
        <Block
          title="Key Concepts"
          items={
            document?.keyConcepts?.length
              ? document.keyConcepts
              : [document?.status === "failed" ? "Processing failed." : "Pending extraction."]
          }
        />
        <Block
          title="Document Info"
          items={[
            `File: ${document?.fileName ?? "Unknown"}`,
            `Pages: ${document?.pageCount ?? "Pending"}`,
            `Chat model: ${document?.chatModel ?? "Pending"}`,
            `Embedding model: ${document?.embeddingModel ?? "Pending"}`
          ]}
        />
        <Block
          title="Suggested Questions"
          items={
            document?.suggestedQuestions?.length
              ? document.suggestedQuestions
              : ["Suggested questions will be generated after summary is ready."]
          }
        />
      </section>
    </aside>
  );
}

function Block({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-foreground/55">
        {title}
      </h2>
      <div className="mt-3 space-y-2">
        {items.map((item) => (
          <div key={item} className="rounded-2xl bg-background px-4 py-3 text-sm leading-6">
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}
