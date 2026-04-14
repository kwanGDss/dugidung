import type { Element, Pillars } from "@/lib/types";

export interface Distribution {
  목: number;
  화: number;
  토: number;
  금: number;
  수: number;
}

export function combineDistribution(a: Pillars, b: Pillars): Distribution {
  const out: Distribution = { 목: 0, 화: 0, 토: 0, 금: 0, 수: 0 };
  for (const el of [...a.elements, ...b.elements]) {
    out[el]++;
  }
  return out;
}

export const ELEMENTS_IN_ORDER: Element[] = ["목", "화", "토", "금", "수"];
