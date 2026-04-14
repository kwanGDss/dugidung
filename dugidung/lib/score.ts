import type { Pillars, Score, MBTI } from "@/lib/types";
import { ohaengScore } from "@/data/ohaeng-rules";
import { zodiacScore } from "@/data/zodiac-compat";
import { mbtiScore } from "@/data/mbti-compat";

const W = { ohaeng: 0.45, zodiac: 0.25, mbti: 0.30 };

export function computeScore(a: Pillars, b: Pillars, mbtiA: MBTI, mbtiB: MBTI): Score {
  const dimensions = {
    ohaeng: ohaengScore(a.element, b.element),
    zodiac: zodiacScore(a.zodiac, b.zodiac),
    mbti: mbtiScore(mbtiA, mbtiB),
  };
  const total = Math.round(
    dimensions.ohaeng * W.ohaeng +
    dimensions.zodiac * W.zodiac +
    dimensions.mbti  * W.mbti,
  );
  return { total, dimensions };
}
