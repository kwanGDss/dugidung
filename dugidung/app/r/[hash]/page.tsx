import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { CompatRecord } from "@/lib/types";
import { defaultStore } from "@/lib/kv";
import { combineDistribution } from "@/lib/ohaeng-distribution";
import ScoreRing from "@/components/ScoreRing";
import DimensionBars from "@/components/DimensionBars";
import LetterView from "@/components/LetterView";
import ShareBar from "@/components/ShareBar";
import ArchetypeBadge from "@/components/ArchetypeBadge";
import PillarCards from "@/components/PillarCards";
import OhaengDistribution from "@/components/OhaengDistribution";
import SeasonCards from "@/components/SeasonCards";

interface Props { params: Promise<{ hash: string }> }

async function load(hash: string): Promise<CompatRecord | null> {
  const rec = await defaultStore().get<CompatRecord>(`compat:${hash}`);
  if (!rec || rec.version !== 2) return null;
  return rec;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { hash } = await params;
  const rec = await load(hash);
  if (!rec) return { title: "두기둥 · 결과를 찾지 못했습니다" };
  const title = `${rec.letter.archetype.name} · ${rec.score.total}점 | 두기둥`;
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
  return (
    <div className="text-center text-[13px] tracking-[0.35em] text-muted mb-10">
      兩 · 두 기 둥
    </div>
  );
}

function Summary({ rec }: { rec: CompatRecord }) {
  const line = (
    i: { birth: string; mbti: string | null; name?: string },
    p: { day: string; element: string },
  ) =>
    `${i.name ? i.name + " · " : ""}${i.birth} · ${p.day}일주 ${p.element} · ${i.mbti ?? "MBTI 미상"}`;
  return (
    <div className="mt-10 pt-6 border-t border-line text-[12px] text-muted text-center leading-[1.9] tracking-wider">
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
  const imageUrl = `${base}/r/${rec.hash}/opengraph-image`;

  const distribution = combineDistribution(rec.pillars.a, rec.pillars.b);

  return (
    <main className="relative min-h-screen px-6 py-16">
      <div className="starfield" aria-hidden />
      <div className="relative max-w-[680px] mx-auto">
        <BrandRow />

        {/* 1. 히어로 */}
        <div className="flex flex-col items-center mb-6">
          <div className="mb-7"><ScoreRing score={rec.score.total} /></div>
          <h1 className="text-[28px] text-accent text-center m-0 tracking-wide">
            {rec.letter.title}
          </h1>
        </div>

        {/* 2. 아키타입 배지 */}
        <ArchetypeBadge archetype={rec.letter.archetype} />

        {/* 3. 네 기둥 카드 */}
        <PillarCards
          a={rec.pillars.a}
          b={rec.pillars.b}
          inputsA={rec.inputs.a}
          inputsB={rec.inputs.b}
        />

        {/* 4. 오행 분포 */}
        <OhaengDistribution distribution={distribution} />

        {/* 5. 차원 점수 바 */}
        <DimensionBars dimensions={rec.score.dimensions} />

        {/* 6. 편지 */}
        <LetterView letter={rec.letter} />

        {/* 7. 관계의 계절 */}
        <SeasonCards seasons={rec.letter.seasons} />

        {/* 8. 요약 */}
        <Summary rec={rec} />

        {/* 10. 공유 바 */}
        <ShareBar
          url={url}
          title={`${rec.letter.archetype.name} · ${rec.score.total}점 — 두기둥`}
          description={rec.letter.pullQuote}
          imageUrl={imageUrl}
        />

        {/* 11. CTA */}
        <div className="text-center mt-14 text-sm text-muted">
          — <a href="/form" className="text-ink underline underline-offset-4">우리도 해보기</a> —
        </div>
      </div>
    </main>
  );
}
