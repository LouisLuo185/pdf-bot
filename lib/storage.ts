import { getEnv } from "./env.ts";
import { getSupabaseAdminClient } from "./supabase.ts";

function sanitizeSegment(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function buildDocumentStoragePath(documentId: string, fileName: string): string {
  const extension = fileName.toLowerCase().endsWith(".pdf") ? ".pdf" : "";
  const baseName = extension ? fileName.slice(0, -extension.length) : fileName;
  const safeBaseName = sanitizeSegment(baseName) || "document";

  return `documents/${documentId}/${safeBaseName}${extension || ".pdf"}`;
}

export async function uploadDocumentFile(
  documentId: string,
  file: File
): Promise<{ storagePath: string; bucket: string }> {
  const supabase = getSupabaseAdminClient() as any;
  const bucket = getEnv().SUPABASE_STORAGE_BUCKET;
  const storagePath = buildDocumentStoragePath(documentId, file.name);
  const arrayBuffer = await file.arrayBuffer();

  const { error } = await supabase.storage.from(bucket).upload(storagePath, arrayBuffer, {
    contentType: file.type || "application/pdf",
    cacheControl: "3600",
    upsert: false
  });

  if (error) {
    throw new Error(`Failed to upload PDF to storage: ${error.message}`);
  }

  return { storagePath, bucket };
}

export async function downloadDocumentFile(storagePath: string): Promise<Buffer> {
  const supabase = getSupabaseAdminClient() as any;
  const bucket = getEnv().SUPABASE_STORAGE_BUCKET;
  const { data, error } = await supabase.storage.from(bucket).download(storagePath);

  if (error || !data) {
    throw new Error(`Failed to download PDF from storage: ${error?.message ?? "Unknown error"}`);
  }

  const arrayBuffer = await data.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
