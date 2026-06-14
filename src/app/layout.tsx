import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI_PROMPT_GENERATOR v1.0",
  description: "AI 프롬프트 생성기 - Terminal Edition",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
