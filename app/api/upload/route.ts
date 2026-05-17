import { NextResponse } from "next/server";
import {
  continueDocumentIngestion,
  initializeDocumentUpload
} from "@/lib/upload";
import { validatePdfUpload } from "@/lib/validators";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file");

  const validation = validatePdfUpload(file);
  if (!validation.success) {
    return NextResponse.json(
      { error: validation.error },
      { status: 400 }
    );
  }

  try {
    const document = await initializeDocumentUpload(validation.file);
    void continueDocumentIngestion(document.id).catch((error) => {
      console.error("Background document ingestion failed:", error);
    });

    return NextResponse.json({
      documentId: document.id,
      fileName: document.fileName,
      status: document.status
    }, { status: 202 });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to initialize document upload."
      },
      { status: 500 }
    );
  }
}
