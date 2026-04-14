import { describe, it, expect } from "vitest";
import { computeScore } from "@/lib/score";
import type { Pillars } from "@/lib/types";

// Abstract test fixtures — not tied to real lunar-javascript output.
// computeScore only uses pillars.element and pillars.zodiac.
const A: Pillars = { year: "을해", month: "기묘", day: "갑자", zodiac: "돼지", element: "목" };
const B: Pillars = { year: "병자", month: "병신", day: "정유", zodiac: "쥐",   element: "화" };

describe("computeScore", () => {
  it("returns 3 dimensions and a total in 0-100", () => {
    const s = computeScore(A, B, "INFP", "ESTJ");
    expect(s.dimensions.ohaeng).toBeGreaterThanOrEqual(0);
    expect(s.dimensions.zodiac).toBeGreaterThanOrEqual(0);
    expect(s.dimensions.mbti).toBeGreaterThanOrEqual(0);
    expect(s.total).toBeGreaterThanOrEqual(0);
    expect(s.total).toBeLessThanOrEqual(100);
  });

  it("is symmetric across (A,B) vs (B,A) for total", () => {
    const ab = computeScore(A, B, "INFP", "ESTJ").total;
    const ba = computeScore(B, A, "ESTJ", "INFP").total;
    // ohaeng has a 2-point sheng ordering asymmetry (90 vs 88), mbti is symmetric, zodiac is symmetric.
    // So total can differ by at most round(2 * 0.45) = 1.
    expect(Math.abs(ab - ba)).toBeLessThanOrEqual(1);
  });

  it("hand-checked: A목 × B화 (상생) + 돼지×쥐 default + INFP×ESTJ = total 78", () => {
    const s = computeScore(A, B, "INFP", "ESTJ");
    // ohaeng 90 (목→화 a_sheng_b)
    // zodiac 65 (돼지-쥐: not samhap/yukhap/yukchung/wonjin/same → default)
    // mbti 70 (55 + 10(EI diff) - 5(NS diff) + 5(TF diff) + 5(JP diff))
    // total = round(90*0.45 + 65*0.25 + 70*0.30) = round(40.5 + 16.25 + 21) = round(77.75) = 78
    expect(s.dimensions.ohaeng).toBe(90);
    expect(s.dimensions.zodiac).toBe(65);
    expect(s.dimensions.mbti).toBe(70);
    expect(s.total).toBe(78);
  });

  it("uses neutral 65 for mbti when either side is null (모름)", () => {
    const sNullA = computeScore(A, B, null, "ESTJ");
    const sNullB = computeScore(A, B, "INFP", null);
    const sBoth  = computeScore(A, B, null, null);
    expect(sNullA.dimensions.mbti).toBe(65);
    expect(sNullB.dimensions.mbti).toBe(65);
    expect(sBoth.dimensions.mbti).toBe(65);
    // ohaeng 90 + zodiac 65 + mbti 65 → round(40.5 + 16.25 + 19.5) = round(76.25) = 76
    expect(sBoth.total).toBe(76);
  });
});
