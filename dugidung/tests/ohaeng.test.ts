import { describe, it, expect } from "vitest";
import { ohaengScore } from "@/data/ohaeng-rules";

describe("ohaengScore", () => {
  it("same element (비화) = 70", () => {
    expect(ohaengScore("목", "목")).toBe(70);
  });
  it("a sheng b (목→화) = 90", () => {
    expect(ohaengScore("목", "화")).toBe(90);
  });
  it("b sheng a (화→목 reversed) = 88", () => {
    expect(ohaengScore("화", "목")).toBe(88);
  });
  it("a ke b (목→토) = 45", () => {
    expect(ohaengScore("목", "토")).toBe(45);
  });
  it("b ke a (토→목 reversed) = 42", () => {
    expect(ohaengScore("토", "목")).toBe(42);
  });
});
