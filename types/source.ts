export type SourceChunk = {
  id: string;
  documentId: string;
  content: string;
  pageNumber: number | null;
  chunkIndex: number;
  charStart?: number | null;
  charEnd?: number | null;
  excerpt?: string;
  similarity?: number;
};
