import { UploadBox } from "@/components/upload-box";

export default function HomePage() {
  return (
    <main className="min-h-screen px-6 py-10 md:px-10">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-[32px] border border-border bg-panel p-8 shadow-panel md:p-12">
          <p className="mb-4 inline-flex rounded-full bg-accentSoft px-3 py-1 text-sm font-medium text-foreground">
            AI PDF Chat MVP
          </p>
          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight md:text-6xl">
            Turn long PDFs into a searchable learning workspace.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-foreground/75 md:text-lg">
            Upload a document, generate a structured brief, and ask questions with source-backed answers.
          </p>
        </section>

        <aside className="rounded-[32px] border border-border bg-panel p-6 shadow-panel md:p-8">
          <h2 className="text-xl font-semibold">Upload a PDF</h2>
          <p className="mt-2 text-sm leading-6 text-foreground/70">
            MVP scope: one text-based PDF, one document workspace, one grounded answer flow.
          </p>
          <div className="mt-6">
            <UploadBox />
          </div>
        </aside>
      </div>
    </main>
  );
}
