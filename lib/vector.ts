import { DEFAULT_MATCH_COUNT } from "./constants.ts";
import { mapChunkRowToSource, toChunkInsertRows, type ChunkRow } from "./db.ts";
import { embedText } from "./embedding.ts";
import { getSupabaseAdminClient } from "./supabase.ts";
import type { DocumentChunk } from "../types/document.ts";
import type { SourceChunk } from "../types/source.ts";

function formatVectorUpdateError(message: string): Error {
  if (/expected \d+ dimensions, not \d+/i.test(message)) {
    return new Error(
      "Failed to update chunk embedding: the database vector column is locked to a fixed size. " +
        "Run sql/migrations/20260517_relax_embedding_dimensions.sql in Supabase, then re-upload the PDF."
    );
  }

  return new Error(`Failed to update chunk embedding: ${message}`);
}

export async function storeChunks(
  documentId: string,
  chunks: DocumentChunk[],
  embeddings?: number[][]
): Promise<void> {
  if (!chunks.length) return;

  const supabase = getSupabaseAdminClient() as any;
  const { error } = await supabase.from("chunks").insert(
    toChunkInsertRows(documentId, chunks, embeddings)
  );

  if (error) {
    throw new Error(`Failed to store chunks: ${error.message}`);
  }
}

export async function clearDocumentChunks(documentId: string): Promise<void> {
  const supabase = getSupabaseAdminClient() as any;
  const { error } = await supabase.from("chunks").delete().eq("document_id", documentId);

  if (error) {
    throw new Error(`Failed to clear existing chunks: ${error.message}`);
  }
}

export async function listDocumentChunks(
  documentId: string
): Promise<ChunkRow[]> {
  const supabase = getSupabaseAdminClient() as any;
  const { data, error } = await supabase
    .from("chunks")
    .select("id, document_id, content, page_number, chunk_index, char_start, char_end, embedding")
    .eq("document_id", documentId)
    .order("page_number", { ascending: true })
    .order("chunk_index", { ascending: true });

  if (error) {
    throw new Error(`Failed to list chunks: ${error.message}`);
  }

  return (data ?? []) as ChunkRow[];
}

export async function updateChunkEmbedding(
  chunkId: string,
  embedding: number[]
): Promise<void> {
  const supabase = getSupabaseAdminClient() as any;
  const { error } = await supabase
    .from("chunks")
    .update({ embedding })
    .eq("id", chunkId);

  if (error) {
    throw formatVectorUpdateError(error.message);
  }
}

export async function updateChunkEmbeddings(
  updates: Array<{ chunkId: string; embedding: number[] }>
): Promise<void> {
  for (const update of updates) {
    await updateChunkEmbedding(update.chunkId, update.embedding);
  }
}

export async function searchRelevantChunks(
  documentId: string,
  question: string,
  topK = DEFAULT_MATCH_COUNT
): Promise<SourceChunk[]> {
  const queryEmbedding = await embedText(question);
  return searchRelevantChunksByEmbedding(documentId, queryEmbedding, topK);
}

export async function searchRelevantChunksByEmbedding(
  documentId: string,
  queryEmbedding: number[],
  topK = DEFAULT_MATCH_COUNT
): Promise<SourceChunk[]> {
  const supabase = getSupabaseAdminClient() as any;
  const { data, error } = await supabase.rpc("match_chunks", {
    query_embedding: queryEmbedding,
    match_document_id: documentId,
    match_count: topK
  });

  if (error) {
    throw new Error(`Failed to search relevant chunks: ${error.message}`);
  }

  return ((data ?? []) as ChunkRow[]).map(mapChunkRowToSource);
}
