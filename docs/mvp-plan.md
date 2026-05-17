# 3-Day MVP Delivery Plan

## Day 1: Foundation and ingestion baseline

- Initialize the Next.js application skeleton
- Define database schema and vector search RPC
- Build upload page and shared layout
- Implement file validation and upload API contract
- Stub PDF parsing, chunking, embedding, and persistence modules

## Day 2: Document processing and retrieval

- Implement PDF text extraction by page
- Implement chunking with overlap and metadata
- Implement embedding batching and chunk storage
- Implement document summary generation
- Implement retrieval context builder and source payload shape

## Day 3: Chat experience and hardening

- Build chat page and message flow
- Implement answer generation with source-backed retrieval
- Add optional streaming upgrade
- Add processing, empty-state, and failure-state UX
- Final local verification and deployment checklist

## Feature slices

1. Project foundation and environment wiring
2. Database schema and vector retrieval
3. Upload and document lifecycle
4. PDF extraction and chunking
5. Embeddings and vector persistence
6. Document summary generation
7. Retrieval orchestration
8. Chat answering and source citations
9. Frontend polish, error handling, and deployment prep

## Delivery principle

Ship a correct non-streaming answer flow first. Add streaming only after retrieval quality and citation shape are stable.
