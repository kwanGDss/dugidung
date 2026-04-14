import type { Pillars, Score, MBTI } from "@/lib/types";
import { ohaengRelation } from "@/data/ohaeng-rules";

export const PROMPT_VERSION = "2.0";

export const SYSTEM_PROMPT = `당신은 "두기둥"이라는 커플 궁합 편지 작가입니다.
사주의 오행과 12지, 그리고 MBTI를 근거로 두 사람에게 건네는 편지와, 그 커플의 유형, 그리고 관계의 세 면을 함께 써냅니다.

톤:
- 명상적이고 따뜻하되, 감상에 빠지지 않는다.
- 한국어. 존댓말이 아닌 담담한 평어체("~이다", "~한다").
- 비유는 자연물(계절, 물, 나무, 불, 바람)을 우선. 별·운명 같은 상투적 표현 금지.
- 점수가 낮아도 부정하지 않고 "어떤 계절"로 번역한다.

금지:
- "천생연분", "환상의 커플", "영혼의 단짝", "불꽃커플", "운명의 짝" 같은 밈 클리셰
- 이모지
- 마크다운(**, ## 등)
- "~할 것입니다" 같은 예언조

출력 구조:
너의 출력은 편지 한 편, 그 커플의 유형 이름, 그리고 관계의 세 면(강점/긴장/조언)을 포함한다.

아키타입:
- 자연물 비유 기반 유형명 — 4~10자, 새로 지어낸 이름
- 위의 밈 클리셰는 금지
- description 은 30~60자, 이 유형이 어떤 관계인지 한 줄로

계절 3 카드 (각각 30~80자, 1~2문장):
- 강점: 이 관계가 잘 굴러가는 이유. 구체적으로. 관념적 찬사 금지.
- 긴장: 어디서 미끄러지는지. 비난이 아닌 관찰 톤.
- 조언: 일상에서 바로 쓸 수 있는 한 가지 행동. 추상 금지.`;

function ohaengRelationText(a: Pillars, b: Pillars): string {
  const r = ohaengRelation(a.element, b.element);
  const map = {
    same: `둘 다 ${a.element} 오행 — 비화`,
    a_sheng_b: `${a.element}이 ${b.element}을 생한다`,
    b_sheng_a: `${b.element}이 ${a.element}을 생한다`,
    a_ke_b: `${a.element}이 ${b.element}을 극한다`,
    b_ke_a: `${b.element}이 ${a.element}을 극한다`,
  } as const;
  return map[r];
}

export function buildUserPrompt(args: {
  a: { birth: string; mbti: MBTI | null; pillars: Pillars };
  b: { birth: string; mbti: MBTI | null; pillars: Pillars };
  score: Score;
}): string {
  const { a, b, score } = args;
  const mbtiText = (m: MBTI | null) => m ?? "MBTI 미상";
  const bothKnown = a.mbti && b.mbti;
  const mbtiNote = bothKnown
    ? ""
    : "\n\n주의: 한쪽 또는 양쪽 모두 MBTI 가 미상이다. 사주(일간 오행 + 띠) 만으로 두 사람의 기질을 추론하고, MBTI 를 언급하지 말 것.";

  return `다음 두 사람의 관계를 편지로 풀어주세요.

A: ${a.birth}, ${mbtiText(a.mbti)}, 일주 ${a.pillars.day}(${a.pillars.element}), ${a.pillars.zodiac}띠
B: ${b.birth}, ${mbtiText(b.mbti)}, 일주 ${b.pillars.day}(${b.pillars.element}), ${b.pillars.zodiac}띠

오행 관계: ${ohaengRelationText(a.pillars, b.pillars)}
12지: ${a.pillars.zodiac}/${b.pillars.zodiac}

점수:
- 오행 ${score.dimensions.ohaeng}
- 12지 ${score.dimensions.zodiac}
- MBTI ${score.dimensions.mbti}${bothKnown ? "" : " (중립 — 미상)"}
- 총점 ${score.total}${mbtiNote}

아래 JSON 스키마로만 답하세요. 설명·마크다운 금지.

{
  "title": "string (5~12자, 자연물 비유가 담긴 제목)",
  "body": "string (3문단, 각 2~4문장, 문단은 \\n\\n로 구분)",
  "pullQuote": "string (한 문장, 25자 내외, body에 등장하지 않는 새 문장)",
  "archetype": {
    "name": "string (4~10자 유형명)",
    "description": "string (30~60자 설명)"
  },
  "seasons": {
    "strength": "string (30~80자)",
    "tension":  "string (30~80자)",
    "advice":   "string (30~80자)"
  }
}

body 요구사항:
- 첫 문단: 두 사람의 오행/기질이 만나는 장면
- 둘째 문단: 관계의 긴장·균형·계절
- 셋째 문단: 살아가는 태도에 대한 한마디`;
}
