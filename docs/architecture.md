# MVP Architecture

## Product boundary

- Single user
- Single text-based PDF per workspace
- Source-backed document QA
- Summary, key concepts, and suggested questions

## Core pipelines

### Ingestion pipeline

1. Upload file
2. Create document record with `queued` status
3. Parse PDF by page
4. Chunk document with overlap
5. Generate embeddings
6. Store chunks in pgvector
7. Generate summary bundle
8. Mark document `ready`

### Chat pipeline

1. Receive `documentId` and messages
2. Read latest user question
3. Generate query embedding
4. Retrieve top-k chunks
5. Build RAG context
6. Generate answer
7. Return answer with sources

## Code boundaries

- `app/api/upload/route.ts`: upload contract and lifecycle kickoff
- `app/api/chat/route.ts`: question answering contract
- `lib/pdf.ts`: PDF parsing
- `lib/chunk.ts`: chunking and overlap
- `lib/embedding.ts`: embedding provider adapter
- `lib/vector.ts`: persistence and similarity search
- `lib/llm.ts`: summary and answer generation
- `lib/rag.ts`: retrieval orchestration
- `lib/documents.ts`: document repository

## Why this shape works

- Ingestion and chat can evolve independently
- Providers can be swapped behind `lib/*` adapters
- Multi-document support can be added later with conversation and workspace layers
- Source rendering has a stable response shape from day one
