"use client";

import { useState } from "react";

export function UploadBox() {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsUploading(true);

    const formData = new FormData(event.currentTarget);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData
      });

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error ?? "Upload failed.");
      }

      const payload = (await response.json()) as { documentId: string };
      window.location.href = `/chat/${payload.documentId}`;
    } catch (uploadError) {
      setError(
        uploadError instanceof Error ? uploadError.message : "Upload failed."
      );
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <label className="flex min-h-48 cursor-pointer flex-col items-center justify-center rounded-[24px] border border-dashed border-border bg-background p-6 text-center">
        <span className="text-sm font-medium">Choose one PDF</span>
        <span className="mt-2 text-sm text-foreground/65">
          Text-based PDF only, up to 10 MB for MVP
        </span>
        {selectedFileName ? (
          <span className="mt-3 rounded-full bg-white px-3 py-1 text-xs font-medium text-foreground/75">
            {selectedFileName}
          </span>
        ) : null}
        <input
          className="sr-only"
          name="file"
          type="file"
          accept="application/pdf"
          required
          onChange={(event) =>
            setSelectedFileName(event.target.files?.[0]?.name ?? null)
          }
        />
      </label>

      <button
        className="w-full rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={isUploading}
        type="submit"
      >
        {isUploading ? "Processing..." : "Upload and start"}
      </button>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {!error ? (
        <p className="text-xs leading-5 text-foreground/55">
          Upload waits for parsing, embedding, and summary generation before the document becomes chat-ready.
        </p>
      ) : null}
    </form>
  );
}
