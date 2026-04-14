import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "두기둥 · 커플 궁합",
  description: "두 사람의 사주와 기질이 만나는 자리",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
