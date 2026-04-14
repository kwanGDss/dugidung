import type { Pillars, Score, MBTI } from "@/lib/types";
import { ohaengScore } from "@/data/ohaeng-rules";
import { zodiacScore } from "@/data/zodiac-compat";
import { mbtiScore } from "@/data/mbti-compat";

const W = { ohaeng: 0.45, zodiac: 0.25, mbti: 0.30 };

// 중립 점수: 둘 중 한 명이라도 MBTI "모름" 일 때 사용 (무관 수준)
const MBTI_NEUTRAL = 65;

export function computeScore(
  a: Pillars,
  b: Pillars,
  mbtiA: MBTI | null,
  mbtiB: MBTI | null,
): Score {
  const dimensions = {
    ohaeng: ohaengScore(a.element, b.element),
    zodiac: zodiacScore(a.zodiac, b.zodiac),
    mbti: mbtiA && mbtiB ? mbtiScore(mbtiA, mbtiB) : MBTI_NEUTRAL,
  };
  const total = Math.round(
    dimensions.ohaeng * W.ohaeng +
    dimensions.zodiac * W.zodiac +
    dimensions.mbti  * W.mbti,
  );
  return { total, dimensions };
}
