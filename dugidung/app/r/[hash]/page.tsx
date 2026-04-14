import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { CompatRecord } from "@/lib/types";
import { defaultStore } from "@/lib/kv";
import ScoreRing from "@/components/ScoreRing";
import DimensionBars from "@/components/DimensionBars";
import LetterView from "@/components/LetterView";
import ShareBar from "@/components/ShareBar";

interface Props { params: Promise<{ hash: string }> }

async function load(hash: string): Promise<CompatRecord | null> {
  return defaultStore().get<CompatRecord>(`compat:${hash}`);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { hash } = await params;
  const rec = await load(hash);
  if (!rec) return { title: "두기둥 · 결과를 찾지 못했습니다" };
  const title = `${rec.score.total}점 — ${rec.letter.title} | 두기둥`;
  return {
    title,
    description: rec.letter.pullQuote,
    openGraph: {
      title,
      description: rec.letter.pullQuote,
      images: [`/r/${rec.hash}/opengraph-image`],
      type: "website",
    },
    twitter: { card: "summary_large_image", title, description: rec.letter.pullQuote },
  };
}

function BrandRow() {
  return <div className="text-center text-[13px] tracking-[0.35em] text-muted mb-12">兩 · 두 기 둥</div>;
}

function Summary({ rec }: { rec: CompatRecord }) {
  const line = (i: { birth: string; mbti: string | null; name?: string }, p: { day: string; element: string }) =>
    `${i.name ? i.name + " · " : ""}${i.birth} · ${p.day}일주 ${p.element} · ${i.mbti ?? "MBTI 미상"}`;
  return (
    <div className="mt-11 pt-7 border-t border-line text-[12px] text-muted text-center leading-[1.9] tracking-wider">
      A · {line(rec.inputs.a, rec.pillars.a)}<br />
      B · {line(rec.inputs.b, rec.pillars.b)}
    </div>
  );
}

export default async function Result({ params }: Props) {
  const { hash } = await params;
  const rec = await load(hash);
  if (!rec) notFound();

  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  const url = `${base}/r/${rec.hash}`;
  const shareTitle = `${rec.score.total}점 — ${rec.letter.title}`;
  const imageUrl = `${base}/r/${rec.hash}/opengraph-image`;

  return (
    <main className="relative min-h-screen px-6 py-16">
      <div className="starfield" aria-hidden />
      <div className="relative max-w-[680px] mx-auto">
        <BrandRow />

        <div className="flex flex-col items-center mb-10">
          <div className="mb-8"><ScoreRing score={rec.score.total} /></div>
          <h1 className="text-[28px] text-accent text-center m-0 tracking-wide">{rec.letter.title}</h1>
        </div>

        <DimensionBars dimensions={rec.score.dimensions} />

        <LetterView letter={rec.letter} />

        <Summary rec={rec} />

        <ShareBar
          url={url}
          title={shareTitle}
          description={rec.letter.pullQuote}
          imageUrl={imageUrl}
        />

        <div className="text-center mt-14 text-sm text-muted">
          — <a href="/form" className="text-ink underline underline-offset-4">우리도 해보기</a> —
        </div>
      </div>
    </main>
  );
}
