import { getChatProviderConfig, getEmbeddingProviderConfig } from "./ai-provider.ts";
import {
  createDocumentRecord,
  getDocumentById,
  markDocumentFailed,
  markDocumentProcessing
} from "./documents.ts";
import {
  processDocumentEmbeddingStage,
  processDocumentSummaryStage,
  processDocumentTextStage
} from "./ingestion.ts";
import { uploadDocumentFile } from "./storage.ts";
import type { DocumentRecord } from "../types/document.ts";

export function deriveDocumentTitle(fileName: string): string {
  return fileName.replace(/\.pdf$/i, "").trim() || "Untitled document";
}

export async function initializeDocumentUpload(file: File): Promise<DocumentRecord> {
  const chatProvider = getChatProviderConfig();
  const embeddingProvider = getEmbeddingProviderConfig();

  const document = await createDocumentRecord({
    fileName: file.name,
    title: deriveDocumentTitle(file.name),
    embeddingModel: embeddingProvider.model,
    chatModel: chatProvider.model
  });

  try {
    const { storagePath } = await uploadDocumentFile(document.id, file);
    return await markDocumentProcessing(document.id, {
      storagePath
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown upload error.";

    await markDocumentFailed(document.id, message);
    throw error;
  }
}

export async function continueDocumentIngestion(
  documentId: string
): Promise<DocumentRecord> {
  const document = await getDocumentById(documentId);

  if (!document) {
    throw new Error("Document not found during ingestion.");
  }

  try {
    const textReadyDocument = await processDocumentTextStage(document);
    const embeddingReadyDocument = await processDocumentEmbeddingStage(textReadyDocument);
    return await processDocumentSummaryStage(embeddingReadyDocument);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown ingestion error.";

    await markDocumentFailed(documentId, message);
    throw error;
  }
}
