import type { CreateDocumentInput, DocumentChunk, DocumentRecord, UpdateDocumentInput } from "../types/document.ts";
import type { SourceChunk } from "../types/source.ts";

export type DocumentRow = {
  id: string;
  title: string | null;
  file_name: string;
  storage_path: string | null;
  summary: string | null;
  key_concepts: unknown;
  suggested_questions: unknown;
  status: DocumentRecord["status"];
  error_message: string | null;
  page_count: number | null;
  embedding_model: string | null;
  chat_model: string | null;
  created_at: string;
  updated_at: string;
};

export type ChunkRow = {
  id: string;
  document_id: string;
  content: string;
  page_number: number | null;
  chunk_index: number;
  char_start: number | null;
  char_end: number | null;
  embedding?: number[] | null;
  similarity?: number | null;
};

export type ChunkInsertRow = {
  document_id: string;
  content: string;
  page_number: number;
  chunk_index: number;
  char_start: number;
  char_end: number;
  token_count: number | null;
  embedding?: number[] | null;
};

function parseStringArray(value: unknown): string[] | null {
  if (!Array.isArray(value)) return null;
  return value.filter((item): item is string => typeof item === "string");
}

export function mapDocumentRow(row: DocumentRow): DocumentRecord {
  return {
    id: row.id,
    title: row.title,
    fileName: row.file_name,
    storagePath: row.storage_path,
    summary: row.summary,
    keyConcepts: parseStringArray(row.key_concepts),
    suggestedQuestions: parseStringArray(row.suggested_questions),
    status: row.status,
    errorMessage: row.error_message,
    pageCount: row.page_count,
    embeddingModel: row.embedding_model,
    chatModel: row.chat_model,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export function toDocumentInsert(input: CreateDocumentInput) {
  return {
    title: input.title ?? null,
    file_name: input.fileName,
    storage_path: input.storagePath ?? null,
    status: "queued" as const,
    embedding_model: input.embeddingModel ?? null,
    chat_model: input.chatModel ?? null
  };
}

export function toDocumentUpdate(input: UpdateDocumentInput) {
  return {
    ...(input.title !== undefined ? { title: input.title } : {}),
    ...(input.storagePath !== undefined ? { storage_path: input.storagePath } : {}),
    ...(input.summary !== undefined ? { summary: input.summary } : {}),
    ...(input.keyConcepts !== undefined ? { key_concepts: input.keyConcepts } : {}),
    ...(input.suggestedQuestions !== undefined
      ? { suggested_questions: input.suggestedQuestions }
      : {}),
    ...(input.status !== undefined ? { status: input.status } : {}),
    ...(input.errorMessage !== undefined ? { error_message: input.errorMessage } : {}),
    ...(input.pageCount !== undefined ? { page_count: input.pageCount } : {}),
    ...(input.embeddingModel !== undefined
      ? { embedding_model: input.embeddingModel }
      : {}),
    ...(input.chatModel !== undefined ? { chat_model: input.chatModel } : {}),
    updated_at: new Date().toISOString()
  };
}

export function estimateTokenCount(text: string): number {
  return Math.ceil(text.length / 4);
}

export function toChunkInsertRows(
  documentId: string,
  chunks: DocumentChunk[],
  embeddings?: number[][]
): ChunkInsertRow[] {
  return chunks.map((chunk, index) => ({
    document_id: documentId,
    content: chunk.content,
    page_number: chunk.pageNumber,
    chunk_index: chunk.chunkIndex,
    char_start: chunk.charStart,
    char_end: chunk.charEnd,
    token_count: estimateTokenCount(chunk.content),
    embedding: embeddings?.[index] ?? null
  }));
}

export function buildExcerpt(content: string, maxLength = 220): string {
  const normalized = content.replace(/\s+/g, " ").trim();
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, maxLength).trimEnd()}...`;
}

export function mapChunkRowToSource(row: ChunkRow): SourceChunk {
  return {
    id: row.id,
    documentId: row.document_id,
    content: row.content,
    pageNumber: row.page_number,
    chunkIndex: row.chunk_index,
    charStart: row.char_start,
    charEnd: row.char_end,
    excerpt: buildExcerpt(row.content),
    similarity: row.similarity ?? undefined
  };
}
