import { describe, it, expect } from "vitest";
import { explainScore } from "@/lib/score-explanation";
import type { Pillars } from "@/lib/types";

const A: Pillars = {
  year: "을해", month: "기묘", day: "갑자",
  zodiac: "돼지", element: "목",
  elements: ["목", "수", "토", "목", "목", "수"],
};
const B: Pillars = {
  year: "병자", month: "병신", day: "정유",
  zodiac: "쥐", element: "화",
  elements: ["화", "수", "화", "금", "화", "금"],
};

describe("explainScore", () => {
  it("produces the three weighted product lines and the raw sum", () => {
    const score = { total: 78, dimensions: { ohaeng: 90, zodiac: 65, mbti: 70 } };
    const ex = explainScore(A, B, "INFP", "ESTJ", score);
    expect(ex.lines).toEqual([
      "오행 90 × 0.45 = 40.5",
      "십이지 65 × 0.25 = 16.25",
      "MBTI 70 × 0.30 = 21",
    ]);
    expect(ex.rawSum).toBeCloseTo(77.75, 2);
  });

  it("explains the ohaeng sheng relationship in human Korean", () => {
    const score = { total: 78, dimensions: { ohaeng: 90, zodiac: 65, mbti: 70 } };
    const ex = explainScore(A, B, "INFP", "ESTJ", score);
    expect(ex.relations[0]).toContain("오행");
    expect(ex.relations[0]).toContain("목");
    expect(ex.relations[0]).toContain("화");
    expect(ex.relations[0]).toContain("생");
  });

  it("marks the mbti line as 미상 when either side is null", () => {
    const score = { total: 65, dimensions: { ohaeng: 90, zodiac: 65, mbti: 65 } };
    const ex = explainScore(A, B, null, "ESTJ", score);
    expect(ex.relations.find((l) => l.startsWith("MBTI"))).toContain("미상");
  });
});
