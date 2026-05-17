alter table chunks
  alter column embedding type vector
  using embedding::vector;

drop function if exists match_chunks(vector(1536), uuid, int);

create or replace function match_chunks (
  query_embedding vector,
  match_document_id uuid,
  match_count int default 5
)
returns table (
  id uuid,
  document_id uuid,
  content text,
  page_number integer,
  chunk_index integer,
  similarity float
)
language sql stable
as $$
  select
    chunks.id,
    chunks.document_id,
    chunks.content,
    chunks.page_number,
    chunks.chunk_index,
    1 - (chunks.embedding <=> query_embedding) as similarity
  from chunks
  where chunks.document_id = match_document_id
    and chunks.embedding is not null
  order by chunks.embedding <=> query_embedding
  limit match_count;
$$;
