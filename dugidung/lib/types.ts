export type Element = "목" | "화" | "토" | "금" | "수";
export type Zodiac = "쥐" | "소" | "호랑이" | "토끼" | "용" | "뱀" | "말" | "양" | "원숭이" | "닭" | "개" | "돼지";
export type MBTI = string; // 4-letter uppercase, validated at boundary

export interface Pillars {
  year: string;   // 을해
  month: string;  // 기묘
  day: string;    // 갑자
  zodiac: Zodiac;
  element: Element; // 일간 오행
}

export interface Inputs {
  birth: string; // YYYY-MM-DD
  mbti: MBTI | null; // null = 모름
  name?: string;
}

export interface Score {
  total: number;
  dimensions: { ohaeng: number; zodiac: number; mbti: number };
}

export interface Letter {
  title: string;
  body: string;
  pullQuote: string;
  promptVersion: string;
  source: "llm" | "fallback";
}

export interface CompatRecord {
  version: 1;
  hash: string;
  createdAt: string;
  inputs: { a: Inputs; b: Inputs };
  pillars: { a: Pillars; b: Pillars };
  score: Score;
  letter: Letter;
}
