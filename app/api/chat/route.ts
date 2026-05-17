import { NextResponse } from "next/server";
import { getDocumentById } from "@/lib/documents";
import { buildRagContext } from "@/lib/rag";
import { generateRagAnswer } from "@/lib/llm";
import { chatRequestSchema } from "@/lib/validators";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const payload = await request.json();
  const parsed = chatRequestSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid chat payload." },
      { status: 400 }
    );
  }

  try {
    const document = await getDocumentById(parsed.data.documentId);

    if (!document) {
      return NextResponse.json(
        { error: "Document not found." },
        { status: 404 }
      );
    }

    if (document.status !== "ready") {
      return NextResponse.json(
        {
          error:
            document.status === "failed"
              ? "This document failed during processing and cannot be queried."
              : "This document is still processing. Please try again shortly."
        },
        { status: 409 }
      );
    }

    const latestUserMessage = [...parsed.data.messages]
      .reverse()
      .find((message) => message.role === "user");

    if (!latestUserMessage) {
      return NextResponse.json(
        { error: "A user message is required." },
        { status: 400 }
      );
    }

    const rag = await buildRagContext(
      parsed.data.documentId,
      latestUserMessage.content
    );

    const answer = await generateRagAnswer({
      question: latestUserMessage.content,
      contextText: rag.contextText
    });

    return NextResponse.json({
      answer,
      sources: rag.sources
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate chat response."
      },
      { status: 500 }
    );
  }
}
