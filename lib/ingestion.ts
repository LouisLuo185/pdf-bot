import { chunkPdfPages } from "./chunk.ts";
import { updateDocumentRecord } from "./documents.ts";
import { embedMany } from "./embedding.ts";
import { generateDocumentSummary } from "./llm.ts";
import { extractPdfText } from "./pdf.ts";
import { downloadDocumentFile } from "./storage.ts";
import {
  clearDocumentChunks,
  listDocumentChunks,
  storeChunks,
  updateChunkEmbeddings
} from "./vector.ts";
import type { DocumentRecord } from "../types/document.ts";

export async function processDocumentTextStage(
  document: DocumentRecord
): Promise<DocumentRecord> {
  if (!document.storagePath) {
    throw new Error("Document storage path is missing.");
  }

  const fileBuffer = await downloadDocumentFile(document.storagePath);
  const pages = await extractPdfText(fileBuffer);

  if (!pages.length) {
    throw new Error(
      "This PDF may be scanned or image-based. Text extraction is limited."
    );
  }

  const chunks = chunkPdfPages(pages);

  if (!chunks.length) {
    throw new Error("No chunkable text was extracted from this PDF.");
  }

  await clearDocumentChunks(document.id);
  await storeChunks(document.id, chunks);

  return updateDocumentRecord(document.id, {
    pageCount: pages.length
  });
}

export async function processDocumentEmbeddingStage(
  document: DocumentRecord
): Promise<DocumentRecord> {
  const chunks = await listDocumentChunks(document.id);

  if (!chunks.length) {
    throw new Error("No chunks were found for embedding generation.");
  }

  const embeddings = await embedMany(chunks.map((chunk) => chunk.content));

  if (embeddings.length !== chunks.length) {
    throw new Error("Embedding count did not match chunk count.");
  }

  await updateChunkEmbeddings(
    chunks.map((chunk, index) => ({
      chunkId: chunk.id,
      embedding: embeddings[index]
    }))
  );

  return updateDocumentRecord(document.id, {
    embeddingModel: document.embeddingModel
  });
}

export async function processDocumentSummaryStage(
  document: DocumentRecord
): Promise<DocumentRecord> {
  const chunks = await listDocumentChunks(document.id);

  if (!chunks.length) {
    throw new Error("No chunks were found for summary generation.");
  }

  const summary = await generateDocumentSummary(
    chunks.map((chunk) => chunk.content)
  );

  return updateDocumentRecord(document.id, {
    summary: summary.summary,
    keyConcepts: summary.keyConcepts,
    suggestedQuestions: summary.suggestedQuestions,
    status: "ready",
    errorMessage: null
  });
}
