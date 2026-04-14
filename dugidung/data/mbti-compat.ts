import type { MBTI } from "@/lib/types";

// Keys are stored in lexicographically sorted order so lookups are
// order-independent (see `overrideKey`). Conceptually these are the pairs:
//   INTJ-ESFP: -5, INFJ-ENFP: +2, ENTJ-INFP: +1
const OVERRIDES: Record<string, number> = {
  "ESFP-INTJ": -5,
  "ENFP-INFJ": 2,
  "ENTJ-INFP": 1,
};

function overrideKey(a: string, b: string): string {
  return a < b ? `${a}-${b}` : `${b}-${a}`;
}

function pairScore(a: string, b: string): number {
  let s = 55;
  // E/I
  s += a[0] === b[0] ? 5 : 10;
  // N/S (가장 중요)
  s += a[1] === b[1] ? 15 : -5;
  // T/F
  s += a[2] === b[2] ? 10 : 5;
  // J/P
  s += a[3] === b[3] ? 10 : 5;
  return s;
}

export function mbtiScore(a: MBTI, b: MBTI): number {
  const base = pairScore(a, b);
  const over = OVERRIDES[overrideKey(a, b)] ?? 0;
  return base + over;
}
