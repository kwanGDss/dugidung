import { ImageResponse } from "next/og";
import type { CompatRecord } from "@/lib/types";
import { defaultStore } from "@/lib/kv";

export const runtime = "nodejs";
export const alt = "두기둥 궁합 결과";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Google Fonts 에서 한글 서브셋 TTF 를 런타임에 가져와 Satori 에 주입.
 * Satori 는 기본적으로 한글 글리프가 없는 라틴 폰트만 내장하므로,
 * 이 함수 없이는 한글이 tofu/깨진 글리프로 렌더됨.
 */
async function loadKoreanFont(text: string): Promise<ArrayBuffer> {
  const url =
    `https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@500` +
    `&text=${encodeURIComponent(text)}`;
  const cssResp = await fetch(url, {
    headers: {
      // Google Fonts 가 User-Agent 에 따라 다른 format 을 반환 — 모던 브라우저처럼 요청
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
        "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    },
  });
  if (!cssResp.ok) throw new Error(`google fonts css fetch failed: ${cssResp.status}`);
  const css = await cssResp.text();
  const match = css.match(/src:\s*url\(([^)]+)\)\s*format\(['"](woff2?|truetype|opentype)['"]\)/);
  if (!match) throw new Error("font url not found in google fonts css");
  const fontResp = await fetch(match[1]);
  if (!fontResp.ok) throw new Error(`font binary fetch failed: ${fontResp.status}`);
  return fontResp.arrayBuffer();
}

export default async function Image({ params }: { params: Promise<{ hash: string }> }) {
  const { hash } = await params;
  const rec = await defaultStore().get<CompatRecord>(`compat:${hash}`);
  const score = rec?.score.total ?? 0;
  const quote = rec?.letter.pullQuote ?? "두 기둥을 겹쳐봅니다";

  // SVG 도넛: Satori 는 conic-gradient 를 지원 안 해서 SVG circle 로 그림
  const ringR = 115;
  const ringCircumference = 2 * Math.PI * ringR;
  const ringFilled = (ringCircumference * Math.max(0, Math.min(100, score))) / 100;

  // 폰트 로드에 필요한 모든 글리프를 한 번에 subset 요청
  const textForFont = `兩 두 기 둥 ${score} ${quote} dugidungvercelapp0123456789`;
  let fontData: ArrayBuffer | null = null;
  try {
    fontData = await loadKoreanFont(textForFont);
  } catch (err) {
    console.error("og font load failed", err);
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#0E1324",
          display: "flex",
          alignItems: "center",
          color: "#F4E9CE",
          fontFamily: "'Noto Serif KR', serif",
          position: "relative",
        }}
      >
        {/* 좌측: 스코어 도넛 + 브랜드 */}
        <div
          style={{
            width: "42%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            paddingLeft: "6%",
          }}
        >
          <div
            style={{
              width: 280,
              height: 280,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
            }}
          >
            <svg
              width={280}
              height={280}
              viewBox="0 0 280 280"
              style={{ position: "absolute", top: 0, left: 0 }}
            >
              <circle cx={140} cy={140} r={ringR} fill="none" stroke="#232A42" strokeWidth={22} />
              <circle
                cx={140}
                cy={140}
                r={ringR}
                fill="none"
                stroke="#D4B678"
                strokeWidth={22}
                strokeDasharray={`${ringFilled} ${ringCircumference}`}
                strokeLinecap="butt"
                transform="rotate(-90 140 140)"
              />
            </svg>
            <div
              style={{
                display: "flex",
                fontSize: 140,
                color: "#F4E9CE",
                lineHeight: 1,
                position: "relative",
              }}
            >
              {score}
            </div>
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 28,
              fontSize: 22,
              letterSpacing: 8,
              color: "#7A8099",
            }}
          >
            兩 · 두 기 둥
          </div>
        </div>

        {/* 우측: pullQuote */}
        <div
          style={{
            width: "58%",
            paddingRight: "8%",
            paddingLeft: "2%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 52,
              lineHeight: 1.5,
              color: "#F4E9CE",
              textAlign: "center",
              wordBreak: "keep-all",
              maxWidth: "100%",
            }}
          >
            「{quote}」
          </div>
        </div>

        <div
          style={{
            display: "flex",
            position: "absolute",
            right: 48,
            bottom: 32,
            fontSize: 18,
            color: "#7A8099",
            letterSpacing: 2,
            fontFamily: "sans-serif",
          }}
        >
          dugidung.vercel.app
        </div>
      </div>
    ),
    {
      ...size,
      fonts: fontData
        ? [
            {
              name: "Noto Serif KR",
              data: fontData,
              style: "normal",
              weight: 500,
            },
          ]
        : undefined,
    },
  );
}
