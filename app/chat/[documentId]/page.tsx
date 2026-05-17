import { ChatWorkspace } from "@/components/chat-workspace";
import { DocumentSummary } from "@/components/document-summary";
import { getDocumentById } from "@/lib/documents";

type ChatPageProps = {
  params: Promise<{
    documentId: string;
  }>;
};

export default async function ChatPage({ params }: ChatPageProps) {
  const { documentId } = await params;
  const document = await getDocumentById(documentId);

  return (
    <main className="min-h-screen px-6 py-8 md:px-10">
      <ChatWorkspace documentId={documentId} initialDocument={document} />
    </main>
  );
}
