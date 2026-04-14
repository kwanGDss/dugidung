import type { Zodiac } from "@/lib/types";

const SAMHAP: Zodiac[][] = [
  ["호랑이", "말", "개"],      // 인오술 — 화국
  ["뱀", "닭", "소"],          // 사유축 — 금국
  ["원숭이", "쥐", "용"],      // 신자진 — 수국
  ["돼지", "토끼", "양"],      // 해묘미 — 목국
];

const YUKHAP: [Zodiac, Zodiac][] = [
  ["쥐", "소"], ["호랑이", "돼지"], ["토끼", "개"],
  ["용", "닭"], ["뱀", "원숭이"], ["말", "양"],
];

const YUKCHUNG: [Zodiac, Zodiac][] = [
  ["쥐", "말"], ["소", "양"], ["호랑이", "원숭이"],
  ["토끼", "닭"], ["용", "개"], ["뱀", "돼지"],
];

const WONJIN: [Zodiac, Zodiac][] = [
  ["쥐", "양"], ["소", "말"], ["호랑이", "닭"],
  ["토끼", "원숭이"], ["용", "돼지"], ["뱀", "개"],
];

function pairIn(pairs: [Zodiac, Zodiac][], a: Zodiac, b: Zodiac): boolean {
  return pairs.some(([x, y]) => (x === a && y === b) || (x === b && y === a));
}

function samhapContains(a: Zodiac, b: Zodiac): boolean {
  return SAMHAP.some((group) => group.includes(a) && group.includes(b) && a !== b);
}

export function zodiacScore(a: Zodiac, b: Zodiac): number {
  if (samhapContains(a, b)) return 95;
  if (pairIn(YUKHAP, a, b)) return 90;
  if (a === b) return 75;
  if (pairIn(YUKCHUNG, a, b)) return 35;
  if (pairIn(WONJIN, a, b)) return 40;
  return 65;
}
