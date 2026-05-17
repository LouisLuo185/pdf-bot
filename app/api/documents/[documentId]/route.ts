import { NextResponse } from "next/server";
import { getDocumentById } from "@/lib/documents";

type RouteProps = {
  params: Promise<{
    documentId: string;
  }>;
};

export async function GET(_request: Request, { params }: RouteProps) {
  const { documentId } = await params;

  try {
    const document = await getDocumentById(documentId);

    if (!document) {
      return NextResponse.json(
        { error: "Document not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ document });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to load document."
      },
      { status: 500 }
    );
  }
}
