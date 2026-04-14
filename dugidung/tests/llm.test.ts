import { describe, it, expect, vi } from "vitest";
import { generateLetter } from "@/lib/llm";
import type { Pillars, Score } from "@/lib/types";

const A: Pillars = { year: "을해", month: "기묘", day: "갑자", zodiac: "돼지", element: "목" };
const B: Pillars = { year: "병자", month: "병신", day: "정유", zodiac: "쥐", element: "화" };
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
    })]);
    const letter = await generateLetter({
      a: { birth: "1995-03-12", mbti: "INFP", pillars: A },
      b: { birth: "1996-08-21", mbti: "ESTJ", pillars: B },
      score: SCORE,
    }, { call: caller });
    expect(letter.source).toBe("llm");
    expect(letter.title).toBe("나무가 불을 만나면");
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
});
