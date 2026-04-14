// @ts-expect-error — lunar-javascript has no published types
import { Solar } from "lunar-javascript";
import type { Element, Pillars, Zodiac } from "@/lib/types";

export class BirthOutOfRangeError extends Error {
  constructor(date: string) {
    super(`Birth date out of supported range: ${date}`);
    this.name = "BirthOutOfRangeError";
  }
}

// lunar-javascript returns ganzhi in Chinese characters; convert to Korean Hangul.
const STEM_CN_TO_KR: Record<string, string> = {
  甲: "갑", 乙: "을", 丙: "병", 丁: "정", 戊: "무",
  己: "기", 庚: "경", 辛: "신", 壬: "임", 癸: "계",
};

const BRANCH_CN_TO_KR: Record<string, string> = {
  子: "자", 丑: "축", 寅: "인", 卯: "묘", 辰: "진", 巳: "사",
  午: "오", 未: "미", 申: "신", 酉: "유", 戌: "술", 亥: "해",
};

const STEM_TO_ELEMENT: Record<string, Element> = {
  갑: "목", 을: "목",
  병: "화", 정: "화",
  무: "토", 기: "토",
  경: "금", 신: "금",
  임: "수", 계: "수",
};

const ZODIAC_FROM_BRANCH: Record<string, Zodiac> = {
  자: "쥐", 축: "소", 인: "호랑이", 묘: "토끼",
  진: "용", 사: "뱀", 오: "말", 미: "양",
  신: "원숭이", 유: "닭", 술: "개", 해: "돼지",
};

const BRANCH_TO_ELEMENT: Record<string, Element> = {
  자: "수", 축: "토", 인: "목", 묘: "목",
  진: "토", 사: "화", 오: "화", 미: "토",
  신: "금", 유: "금", 술: "토", 해: "수",
};

function parseDate(input: string): { y: number; m: number; d: number } {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(input);
  if (!m) throw new Error(`invalid date format: ${input}`);
  return { y: Number(m[1]), m: Number(m[2]), d: Number(m[3]) };
}

function ganzhiCnToKr(cn: string): string {
  if (cn.length !== 2) throw new Error(`unexpected ganzhi: ${cn}`);
  const stem = STEM_CN_TO_KR[cn[0]];
  const branch = BRANCH_CN_TO_KR[cn[1]];
  if (!stem || !branch) throw new Error(`unmapped ganzhi: ${cn}`);
  return stem + branch;
}

export function birthToPillars(birth: string): Pillars {
  const { y, m, d } = parseDate(birth);
  if (y < 1900 || y > new Date().getFullYear() + 1) {
    throw new BirthOutOfRangeError(birth);
  }
  const solar = Solar.fromYmd(y, m, d);
  const lunar = solar.getLunar();

  const yearCn: string = lunar.getYearInGanZhi();
  const monthCn: string = lunar.getMonthInGanZhi();
  const dayCn: string = lunar.getDayInGanZhi();

  const year = ganzhiCnToKr(yearCn);
  const month = ganzhiCnToKr(monthCn);
  const day = ganzhiCnToKr(dayCn);

  const dayStem = day[0];
  const yearBranch = year[1];

  const element = STEM_TO_ELEMENT[dayStem];
  const zodiac = ZODIAC_FROM_BRANCH[yearBranch];
  if (!element || !zodiac) {
    throw new Error(`failed to derive element/zodiac from ${year}/${day}`);
  }

  // 연/월/일주 각각의 천간(stem) + 지지(branch) 오행 6개 — 시주 미포함
  const elements: Element[] = [
    STEM_TO_ELEMENT[year[0]],
    BRANCH_TO_ELEMENT[year[1]],
    STEM_TO_ELEMENT[month[0]],
    BRANCH_TO_ELEMENT[month[1]],
    STEM_TO_ELEMENT[day[0]],
    BRANCH_TO_ELEMENT[day[1]],
  ];
  if (elements.some((e) => !e)) {
    throw new Error(`failed to derive elements from ${year}/${month}/${day}`);
  }

  return { year, month, day, zodiac, element, elements };
}
