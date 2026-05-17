export type DocumentStatus = "queued" | "processing" | "ready" | "failed";

export type PdfPageText = {
  pageNumber: number;
  text: string;
};

export type DocumentChunk = {
  content: string;
  pageNumber: number;
  chunkIndex: number;
  charStart: number;
  charEnd: number;
};

export type DocumentRecord = {
  id: string;
  title: string | null;
  fileName: string;
  storagePath?: string | null;
  summary: string | null;
  keyConcepts: string[] | null;
  suggestedQuestions: string[] | null;
  status: DocumentStatus;
  errorMessage: string | null;
  pageCount: number | null;
  embeddingModel?: string | null;
  chatModel?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateDocumentInput = {
  title?: string | null;
  fileName: string;
  storagePath?: string | null;
  embeddingModel?: string | null;
  chatModel?: string | null;
};

export type UpdateDocumentInput = {
  title?: string | null;
  storagePath?: string | null;
  summary?: string | null;
  keyConcepts?: string[] | null;
  suggestedQuestions?: string[] | null;
  status?: DocumentStatus;
  errorMessage?: string | null;
  pageCount?: number | null;
  embeddingModel?: string | null;
  chatModel?: string | null;
};
