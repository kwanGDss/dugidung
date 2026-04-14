import { ImageResponse } from "next/og";
import type { CompatRecord } from "@/lib/types";
import { defaultStore } from "@/lib/kv";

export const runtime = "edge";
export const alt = "두기둥 궁합 결과";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ hash: string }> }) {
  const { hash } = await params;
  const rec = await defaultStore().get<CompatRecord>(`compat:${hash}`);
  const score = rec?.score.total ?? 0;
  const quote = rec?.letter.pullQuote ?? "두 기둥을 겹쳐봅니다";

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
          fontFamily: "serif",
          position: "relative",
        }}
      >
        {/* left: score */}
        <div
          style={{
            width: "42%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            paddingLeft: "8%",
          }}
        >
          <div
            style={{
              width: 260,
              height: 260,
              borderRadius: "50%",
              background: `conic-gradient(#D4B678 0% ${score}%, #232A42 ${score}% 100%)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 20,
                borderRadius: "50%",
                background: "#0E1324",
                display: "flex",
              }}
            />
            <span style={{ position: "relative", fontSize: 120, color: "#F4E9CE" }}>{score}</span>
          </div>
          <div
            style={{
              marginTop: 24,
              fontSize: 20,
              letterSpacing: 6,
              color: "#7A8099",
              display: "flex",
            }}
          >
            兩 · 두 기 둥
          </div>
        </div>

        {/* right: pullQuote */}
        <div
          style={{
            width: "58%",
            paddingRight: "8%",
            paddingLeft: "4%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              fontSize: 48,
              lineHeight: 1.55,
              color: "#F4E9CE",
              textAlign: "center",
              display: "flex",
            }}
          >
            <span style={{ color: "#D4B678" }}>「</span>
            {quote}
            <span style={{ color: "#D4B678" }}>」</span>
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            right: 40,
            bottom: 28,
            fontSize: 18,
            color: "#7A8099",
            letterSpacing: 2,
            fontFamily: "sans-serif",
            display: "flex",
          }}
        >
          dugidung.vercel.app
        </div>
      </div>
    ),
    { ...size },
  );
}
