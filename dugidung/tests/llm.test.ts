import { describe, it, expect, vi } from "vitest";
import { generateLetter } from "@/lib/llm";
import type { Pillars, Score } from "@/lib/types";

const A: Pillars = {
  year: "을해", month: "기묘", day: "갑자",
  zodiac: "돼지", element: "목",
  elements: ["목", "수", "토", "목", "목", "수"],
};
const B: Pillars = {
  year: "병자", month: "병신", day: "정유",
  zodiac: "쥐", element: "화",
  elements: ["화", "수", "화", "금", "화", "금"],
};
const SCORE: Score = { total: 78, dimensions: { ohaeng: 90, zodiac: 65, mbti: 70 } };

function makeCaller(responses: Array<string | Error>) {
  let i = 0;
  return vi.fn(async () => {
    const r = responses[i++];
    if (r instanceof Error) throw r;
    return r;
  });
}

describe("generateLetter", () => {
  it("parses a valid JSON response", async () => {
    const caller = makeCaller([JSON.stringify({
      title: "나무가 불을 만나면",
      body: "첫 문단. 한 사람의 기운은 나무로 자라고, 다른 한 사람의 기운은 불로 피어오른다.\n\n둘째 문단. 다만 나무가 너무 젖어 있을 때 불은 애를 먹는다. 속도가 다른 날엔 작은 균열도 생긴다.\n\n셋째 문단. 서두르지 말 것. 천천히 서로의 연료가 되어가는 것으로 충분하다.",
      pullQuote: "너희는 서로에게 연료이자 불씨다",
      archetype: {
        name: "불씨와 장작",
        description: "한쪽이 불을 피우고, 한쪽이 연료를 대는 관계. 서로 없으면 오래 못 탄다.",
      },
      seasons: {
        strength: "속도가 다른 날에도 서로의 온도는 맞다.",
        tension: "한 쪽이 조급할 때 다른 한 쪽이 주춤한다.",
        advice: "싸운 날엔 해명보다 침묵을 먼저.",
      },
      timeline: [
        { when: "지금 · 0~1개월", mood: "말의 속도가 다른 날이 잦다.", action: "오늘 자기 전 10분 마주 앉기." },
        { when: "가까운 미래 · 1~3개월", mood: "익숙함이 편안으로 바뀐다.", action: "이번 주말 새 음식 같이 만들기." },
        { when: "한 계절 · 3~6개월", mood: "열기가 조금 식는 시기.", action: "각자 혼자 있는 시간도 의도적으로 두기." },
        { when: "반년 · 6~12개월", mood: "결이 정해진다. 익숙한 길이 편하지만 지루하기도.", action: "한 번도 안 가본 동네에 반나절 산책." },
        { when: "1년", mood: "어디로 가는지 확인하는 시점.", action: "서로의 1년 뒤 모습을 말로 꺼내 보기." },
        { when: "먼 미래 · 3년 이후", mood: "남아 있다면 장작이 되어 있다.", action: "오늘의 선택 하나가 3년 뒤의 자리를 만든다." },
      ],
    })]);
    const letter = await generateLetter({
      a: { birth: "1995-03-12", mbti: "INFP", pillars: A },
      b: { birth: "1996-08-21", mbti: "ESTJ", pillars: B },
      score: SCORE,
    }, { call: caller });
    expect(letter.source).toBe("llm");
    expect(letter.title).toBe("나무가 불을 만나면");
    expect(letter.archetype.name).toBe("불씨와 장작");
    expect(letter.seasons.advice).toContain("침묵");
    expect(letter.timeline).toHaveLength(6);
    expect(letter.timeline?.[0].when).toBe("지금 · 0~1개월");
    expect(letter.timeline?.[5].when).toBe("먼 미래 · 3년 이후");
  });

  it("accepts response without timeline field (optional)", async () => {
    const caller = makeCaller([JSON.stringify({
      title: "나무가 불을 만나면",
      body: "첫 문단. 한 사람의 기운은 나무로 자라고, 다른 한 사람의 기운은 불로 피어오른다.\n\n둘째 문단. 다만 나무가 너무 젖어 있을 때 불은 애를 먹는다. 속도가 다른 날엔 작은 균열도 생긴다.\n\n셋째 문단. 서두르지 말 것. 천천히 서로의 연료가 되어가는 것으로 충분하다.",
      pullQuote: "너희는 서로에게 연료이자 불씨다",
      archetype: {
        name: "불씨와 장작",
        description: "한쪽이 불을 피우고, 한쪽이 연료를 대는 관계. 서로 없으면 오래 못 탄다.",
      },
      seasons: {
        strength: "속도가 다른 날에도 서로의 온도는 맞다.",
        tension: "한 쪽이 조급할 때 다른 한 쪽이 주춤한다.",
        advice: "싸운 날엔 해명보다 침묵을 먼저.",
      },
      // timeline intentionally missing
    })]);
    const letter = await generateLetter({
      a: { birth: "1995-03-12", mbti: "INFP", pillars: A },
      b: { birth: "1996-08-21", mbti: "ESTJ", pillars: B },
      score: SCORE,
    }, { call: caller });
    expect(letter.source).toBe("llm");
    expect(letter.timeline).toBeUndefined();
  });

  it("retries once on malformed JSON then falls back", async () => {
    const caller = makeCaller(["not json", "still not json"]);
    const letter = await generateLetter({
      a: { birth: "1995-03-12", mbti: "INFP", pillars: A },
      b: { birth: "1996-08-21", mbti: "ESTJ", pillars: B },
      score: SCORE,
    }, { call: caller });
    expect(letter.source).toBe("fallback");
    expect(caller).toHaveBeenCalledTimes(2);
  });

  it("falls back on thrown error after one retry", async () => {
    const caller = makeCaller([new Error("timeout"), new Error("timeout 2")]);
    const letter = await generateLetter({
      a: { birth: "1995-03-12", mbti: "INFP", pillars: A },
      b: { birth: "1996-08-21", mbti: "ESTJ", pillars: B },
      score: SCORE,
    }, { call: caller });
    expect(letter.source).toBe("fallback");
    expect(caller).toHaveBeenCalledTimes(2);
  });

  it("falls back when archetype field is missing from LLM output", async () => {
    const caller = makeCaller([JSON.stringify({
      title: "나무가 불을 만나면",
      body: "첫 문단. 두 사람이 만난다. 한 사람은 나무이고 한 사람은 불이다. 둘이 만나면 한 자리가 따뜻해진다. 길게 이어지는 관계다.\n\n둘째 문단. 속도가 다르다. 어떤 날은 너무 조급하고 어떤 날은 너무 느리다. 그래도 저녁의 온도는 맞는다.\n\n셋째 문단. 서두르지 말 것. 천천히 서로의 연료가 되어가는 것으로 충분하다.",
      pullQuote: "너희는 서로에게 연료이자 불씨다",
      // archetype and seasons missing
    }), "still broken"]);
    const letter = await generateLetter({
      a: { birth: "1995-03-12", mbti: "INFP", pillars: A },
      b: { birth: "1996-08-21", mbti: "ESTJ", pillars: B },
      score: SCORE,
    }, { call: caller });
    expect(letter.source).toBe("fallback");
    // Fallback still has complete archetype + seasons
    expect(letter.archetype.name).toBeTruthy();
    expect(letter.seasons.strength).toBeTruthy();
  });
});
