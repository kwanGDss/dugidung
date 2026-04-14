import { describe, it, expect } from "vitest";
import { zodiacScore } from "@/data/zodiac-compat";
import { mbtiScore } from "@/data/mbti-compat";

describe("zodiacScore", () => {
  it("삼합: 인-오-술 = 95", () => {
    expect(zodiacScore("호랑이", "말")).toBe(95);
    expect(zodiacScore("말", "개")).toBe(95);
  });
  it("육합: 자-축 = 90", () => {
    expect(zodiacScore("쥐", "소")).toBe(90);
  });
  it("same = 75", () => {
    expect(zodiacScore("쥐", "쥐")).toBe(75);
  });
  it("육충: 자-오 = 35", () => {
    expect(zodiacScore("쥐", "말")).toBe(35);
  });
  it("원진: 자-미 = 40", () => {
    expect(zodiacScore("쥐", "양")).toBe(40);
  });
  it("무관 default = 65", () => {
    // 쥐 × 호랑이: not in any special set
    expect(zodiacScore("쥐", "호랑이")).toBe(65);
  });
});

describe("mbtiScore", () => {
  it("INFP × ENFJ (N same, E/I diff, F same, P/J diff) = 95", () => {
    expect(mbtiScore("INFP", "ENFJ")).toBe(95);
  });
  it("INFP × ESTJ (N/S diff, E/I diff, F/T diff, P/J diff) = 70", () => {
    expect(mbtiScore("INFP", "ESTJ")).toBe(70);
  });
  it("is symmetric", () => {
    expect(mbtiScore("INTJ", "ENFP")).toBe(mbtiScore("ENFP", "INTJ"));
  });
  it("applies INTJ-ESFP override (-5)", () => {
    // rule: 55 + -5(NS) + 10(EI) + 5(TF) + 5(JP) = 70, then -5 override = 65
    expect(mbtiScore("INTJ", "ESFP")).toBe(65);
  });
});
