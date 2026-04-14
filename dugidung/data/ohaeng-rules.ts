import type { Element } from "@/lib/types";

export const SHENG: Record<Element, Element> = {
  목: "화", 화: "토", 토: "금", 금: "수", 수: "목",
};

export const KE: Record<Element, Element> = {
  목: "토", 토: "수", 수: "화", 화: "금", 금: "목",
};

export function ohaengRelation(a: Element, b: Element):
  | "same" | "a_sheng_b" | "b_sheng_a" | "a_ke_b" | "b_ke_a" {
  if (a === b) return "same";
  if (SHENG[a] === b) return "a_sheng_b";
  if (SHENG[b] === a) return "b_sheng_a";
  if (KE[a] === b) return "a_ke_b";
  return "b_ke_a";
}

export function ohaengScore(a: Element, b: Element): number {
  switch (ohaengRelation(a, b)) {
    case "same": return 70;
    case "a_sheng_b": return 90;
    case "b_sheng_a": return 88;
    case "a_ke_b": return 45;
    case "b_ke_a": return 42;
  }
}
