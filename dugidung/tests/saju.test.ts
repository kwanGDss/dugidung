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
});
