import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI PDF Chat MVP",
  description: "Upload a PDF and ask grounded questions with source-backed answers."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
