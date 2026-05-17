import type { CreateDocumentInput, DocumentRecord, UpdateDocumentInput } from "../types/document.ts";
import { mapDocumentRow, toDocumentInsert, toDocumentUpdate, type DocumentRow } from "./db.ts";
import { getSupabaseAdminClient } from "./supabase.ts";

export async function createDocumentRecord(
  input: CreateDocumentInput
): Promise<DocumentRecord> {
  const supabase = getSupabaseAdminClient() as any;
  const { data, error } = await supabase
    .from("documents")
    .insert(toDocumentInsert(input))
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(`Failed to create document record: ${error?.message ?? "Unknown error"}`);
  }

  return mapDocumentRow(data as DocumentRow);
}

export async function getDocumentById(
  documentId: string
): Promise<DocumentRecord | null> {
  const supabase = getSupabaseAdminClient() as any;
  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .eq("id", documentId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch document: ${error.message}`);
  }

  if (!data) return null;
  return mapDocumentRow(data as DocumentRow);
}

export async function updateDocumentRecord(
  documentId: string,
  input: UpdateDocumentInput
): Promise<DocumentRecord> {
  const supabase = getSupabaseAdminClient() as any;
  const { data, error } = await supabase
    .from("documents")
    .update(toDocumentUpdate(input))
    .eq("id", documentId)
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(`Failed to update document record: ${error?.message ?? "Unknown error"}`);
  }

  return mapDocumentRow(data as DocumentRow);
}

export async function markDocumentProcessing(
  documentId: string,
  input: Omit<UpdateDocumentInput, "status" | "errorMessage"> = {}
): Promise<DocumentRecord> {
  return updateDocumentRecord(documentId, {
    ...input,
    status: "processing",
    errorMessage: null
  });
}

export async function markDocumentFailed(
  documentId: string,
  errorMessage: string
): Promise<DocumentRecord> {
  return updateDocumentRecord(documentId, {
    status: "failed",
    errorMessage
  });
}

export async function markDocumentReady(
  documentId: string,
  input: Omit<UpdateDocumentInput, "status" | "errorMessage"> = {}
): Promise<DocumentRecord> {
  return updateDocumentRecord(documentId, {
    ...input,
    status: "ready",
    errorMessage: null
  });
}
