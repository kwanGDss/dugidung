import type { MBTI, Pillars, Score } from "@/lib/types";
import { ohaengRelation } from "@/data/ohaeng-rules";

export interface ScoreExplanation {
  lines: string[];       // 가중 곱 라인
  rawSum: number;        // 반올림 전 합
  relations: string[];   // 자연어 관계 설명
}

function formatWeighted(dim: number, weight: number): string {
  const product = dim * weight;
  return product.toString();
}

function ohaengRelationText(a: Pillars, b: Pillars): string {
  const rel = ohaengRelation(a.element, b.element);
  switch (rel) {
    case "same":       return `${a.element} 오행 동일 — 비화`;
    case "a_sheng_b":  return `${a.element}이 ${b.element}을 생한다 — 상생`;
    case "b_sheng_a":  return `${b.element}이 ${a.element}을 생한다 — 상생`;
    case "a_ke_b":     return `${a.element}이 ${b.element}을 극한다 — 상극`;
    case "b_ke_a":     return `${b.element}이 ${a.element}을 극한다 — 상극`;
  }
}

export function explainScore(
  a: Pillars,
  b: Pillars,
  mbtiA: MBTI | null,
  mbtiB: MBTI | null,
  score: Score,
): ScoreExplanation {
  const lines = [
    `오행 ${score.dimensions.ohaeng} × 0.45 = ${formatWeighted(score.dimensions.ohaeng, 0.45)}`,
    `십이지 ${score.dimensions.zodiac} × 0.25 = ${formatWeighted(score.dimensions.zodiac, 0.25)}`,
    `MBTI ${score.dimensions.mbti} × 0.30 = ${formatWeighted(score.dimensions.mbti, 0.30)}`,
  ];

  const rawSum =
    score.dimensions.ohaeng * 0.45 +
    score.dimensions.zodiac * 0.25 +
    score.dimensions.mbti * 0.30;

  const mbtiLabel =
    mbtiA && mbtiB
      ? `${mbtiA} × ${mbtiB} — ${score.dimensions.mbti}점`
      : "MBTI 미상 — 중립 65점";

  const relations = [
    `오행: ${ohaengRelationText(a, b)} (${score.dimensions.ohaeng}점)`,
    `십이지: ${a.zodiac} × ${b.zodiac} — ${score.dimensions.zodiac}점`,
    `MBTI: ${mbtiLabel}`,
  ];

  return { lines, rawSum, relations };
}
