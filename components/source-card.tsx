import type { SourceChunk } from "@/types/source";

type SourceCardProps = {
  source: SourceChunk;
};

export function SourceCard({ source }: SourceCardProps) {
  return (
    <article className="rounded-2xl bg-background px-4 py-3 text-sm leading-6">
      <p className="font-semibold">
        Page {source.pageNumber ?? "?"}, Chunk {source.chunkIndex}
      </p>
      <p className="mt-2 text-foreground/70">{source.excerpt ?? source.content}</p>
    </article>
  );
}
