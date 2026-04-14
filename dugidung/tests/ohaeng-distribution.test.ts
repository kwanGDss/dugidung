import { describe, it, expect } from "vitest";
import { combineDistribution } from "@/lib/ohaeng-distribution";
import type { Pillars } from "@/lib/types";

const A: Pillars = {
  year: "을해", month: "기묘", day: "임인",
  zodiac: "돼지", element: "수",
  elements: ["목", "수", "토", "목", "수", "목"],
};
const B: Pillars = {
  year: "병자", month: "병신", day: "경인",
  zodiac: "쥐", element: "금",
  elements: ["화", "수", "화", "금", "금", "목"],
};

describe("combineDistribution", () => {
  it("sums both pillars' elements into a 5-key object", () => {
    const d = combineDistribution(A, B);
    // A: 목×3, 수×2, 토×1 / B: 화×2, 수×1, 금×2, 목×1
    expect(d).toEqual({
      목: 4,
      화: 2,
      토: 1,
      금: 2,
      수: 3,
    });
  });

  it("all five keys are present even when some are zero", () => {
    const onlyMok: Pillars = { ...A, elements: ["목", "목", "목", "목", "목", "목"] };
    const d = combineDistribution(onlyMok, onlyMok);
    expect(d).toEqual({ 목: 12, 화: 0, 토: 0, 금: 0, 수: 0 });
  });

  it("total count equals 12 (6 elements × 2 people)", () => {
    const d = combineDistribution(A, B);
    const total = d.목 + d.화 + d.토 + d.금 + d.수;
    expect(total).toBe(12);
  });
});
