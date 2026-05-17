import { z } from "zod";
import { MAX_PDF_BYTES } from "./constants.ts";

export function validatePdfUpload(file: FormDataEntryValue | null):
  | { success: true; file: File }
  | { success: false; error: string } {
  if (!(file instanceof File)) {
    return { success: false, error: "Please choose a PDF file." };
  }

  if (file.type !== "application/pdf") {
    return { success: false, error: "Only PDF files are supported." };
  }

  if (file.size > MAX_PDF_BYTES) {
    return { success: false, error: "PDF exceeds the 10 MB MVP limit." };
  }

  return { success: true, file };
}

export const chatRequestSchema = z.object({
  documentId: z.string().uuid(),
  messages: z.array(
    z.object({
      role: z.enum(["user", "assistant"]),
      content: z.string().min(1)
    })
  )
});
