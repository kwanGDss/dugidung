export type Element = "목" | "화" | "토" | "금" | "수";
export type Zodiac = "쥐" | "소" | "호랑이" | "토끼" | "용" | "뱀" | "말" | "양" | "원숭이" | "닭" | "개" | "돼지";
export type MBTI = string;

export interface Pillars {
  year: string;
  month: string;
  day: string;
  zodiac: Zodiac;
  element: Element;           // 일간 오행 (기존)
  elements: Element[];        // NEW — 연/월/일주 천간·지지 6개 오행 (시주 미포함)
}

export interface Inputs {
  birth: string;
  mbti: MBTI | null;
  name?: string;
}

export interface Score {
  total: number;
  dimensions: { ohaeng: number; zodiac: number; mbti: number };
}

export interface Archetype {
  name: string;         // 4~10자
  description: string;  // 30~60자
}

export interface Seasons {
  strength: string;     // 30~80자
  tension: string;
  advice: string;
}

export interface Letter {
  title: string;
  body: string;
  pullQuote: string;
  archetype: Archetype;
  seasons: Seasons;
  promptVersion: string;
  source: "llm" | "fallback";
}

export interface CompatRecord {
  version: 2;                             // bumped from 1
  hash: string;
  createdAt: string;
  inputs: { a: Inputs; b: Inputs };
  pillars: { a: Pillars; b: Pillars };
  score: Score;
  letter: Letter;
}
