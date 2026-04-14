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
