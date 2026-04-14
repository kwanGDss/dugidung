import { describe, it, expect } from "vitest";
import { birthToPillars, BirthOutOfRangeError } from "@/lib/saju";

describe("birthToPillars", () => {
  it("computes day pillar for 1995-03-12 (임인 day, 수 element)", () => {
    const p = birthToPillars("1995-03-12");
    expect(p.day).toBe("임인");
    expect(p.element).toBe("수");
    expect(p.zodiac).toBe("돼지"); // 1995 = 을해
  });

  it("computes day pillar for 1996-08-21 (경인 day, 금 element)", () => {
    const p = birthToPillars("1996-08-21");
    expect(p.day).toBe("경인");
    expect(p.element).toBe("금");
    expect(p.zodiac).toBe("쥐"); // 1996 = 병자
  });

  it("rejects dates before 1900", () => {
    expect(() => birthToPillars("1899-12-31")).toThrow(BirthOutOfRangeError);
  });

  it("rejects dates in the future", () => {
    expect(() => birthToPillars("2999-01-01")).toThrow(BirthOutOfRangeError);
  });

  it("rejects malformed input", () => {
    expect(() => birthToPillars("not-a-date")).toThrow();
  });

  it("returns 6-element array from 연/월/일주 stems + branches", () => {
    const p = birthToPillars("1995-03-12");
    expect(p.elements).toHaveLength(6);
    p.elements.forEach((el) => {
      expect(["목", "화", "토", "금", "수"]).toContain(el);
    });
  });

  it("1995-03-12 pillars 을해/기묘/임인 → 목,수,토,목,수,목", () => {
    const p = birthToPillars("1995-03-12");
    // 을=목, 해=수, 기=토, 묘=목, 임=수, 인=목
    expect(p.elements).toEqual(["목", "수", "토", "목", "수", "목"]);
  });

  it("1996-08-21 pillars 병자/병신/경인 → 화,수,화,금,금,목", () => {
    const p = birthToPillars("1996-08-21");
    // 병=화, 자=수, 병=화, 신=금, 경=금, 인=목
    expect(p.elements).toEqual(["화", "수", "화", "금", "금", "목"]);
  });
});
