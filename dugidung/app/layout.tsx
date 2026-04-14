import "./globals.css";
import type { Metadata } from "next";
import { Noto_Serif_KR } from "next/font/google";

const serif = Noto_Serif_KR({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: "두기둥 · 커플 궁합",
  description: "두 사람의 사주와 기질이 만나는 자리",
  openGraph: {
    title: "두기둥 · 커플 궁합",
    description: "두 사람의 사주와 기질이 만나는 자리",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={serif.variable}>
      <body>{children}</body>
    </html>
  );
}
