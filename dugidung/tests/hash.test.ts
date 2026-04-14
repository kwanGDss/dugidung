import { describe, it, expect } from "vitest";
import { hashInputs, normalizePair } from "@/lib/hash";

const A = { birth: "1995-03-12", mbti: "INFP", name: "가" };
const B = { birth: "1996-08-21", mbti: "ESTJ", name: "나" };

describe("hashInputs", () => {
  it("is deterministic", () => {
    expect(hashInputs(A, B)).toBe(hashInputs(A, B));
  });

  it("is order-invariant (A,B) === (B,A)", () => {
    expect(hashInputs(A, B)).toBe(hashInputs(B, A));
  });

  it("ignores names", () => {
    const A2 = { ...A, name: "다른이름" };
    expect(hashInputs(A2, B)).toBe(hashInputs(A, B));
  });

  it("differs when birth date differs", () => {
    const A2 = { ...A, birth: "1995-03-13" };
    expect(hashInputs(A2, B)).not.toBe(hashInputs(A, B));
  });

  it("differs when mbti differs", () => {
    const A2 = { ...A, mbti: "ENFJ" };
    expect(hashInputs(A2, B)).not.toBe(hashInputs(A, B));
  });

  it("produces 8-character Base62 strings", () => {
    const h = hashInputs(A, B);
    expect(h).toMatch(/^[0-9A-Za-z]{8}$/);
  });
});

describe("normalizePair", () => {
  it("sorts so smaller key comes first", () => {
    const [x, y] = normalizePair(B, A);
    expect(x.birth).toBe(A.birth);
    expect(y.birth).toBe(B.birth);
  });
});
