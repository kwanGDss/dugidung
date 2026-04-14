import { ImageResponse } from "next/og";
import type { CompatRecord } from "@/lib/types";
import { defaultStore } from "@/lib/kv";

export const runtime = "nodejs";
export const alt = "두기둥 궁합 결과";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Noto Serif KR (Korean subset, weight 500) WOFF2 를 co-located 파일에서 로드.
 * Next.js 번들러가 `new URL('./file', import.meta.url)` 패턴을 감지하여
 * 파일을 서버 번들에 자동 포함시킴 — 런타임 외부 네트워크 의존성 제거.
 */
async function loadKoreanFont(): Promise<ArrayBuffer> {
  const fontUrl = new URL("./NotoSerifKR-KR-500.woff2", import.meta.url);
  const resp = await fetch(fontUrl);
  if (!resp.ok) throw new Error(`local font fetch failed: ${resp.status}`);
  return resp.arrayBuffer();
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

  let fontData: ArrayBuffer | null = null;
  try {
    fontData = await loadKoreanFont();
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
