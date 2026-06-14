import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI 프롬프트 생성기",
  description: "목적에 맞는 최적화된 AI 프롬프트를 생성합니다",
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
