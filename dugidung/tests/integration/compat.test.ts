import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST, __setDeps } from "@/app/api/compat/route";
import { createMemoryStore } from "@/lib/kv";

function req(body: unknown, ip = "1.2.3.4"): Request {
  return new Request("http://localhost/api/compat", {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": ip },
    body: JSON.stringify(body),
  });
}

const VALID = {
  a: { birth: "1995-03-12", mbti: "INFP", name: "가" },
  b: { birth: "1996-08-21", mbti: "ESTJ", name: "나" },
};

describe("POST /api/compat", () => {
  let llmCalls = 0;
  beforeEach(() => {
    llmCalls = 0;
    __setDeps({
      store: createMemoryStore(),
      call: vi.fn(async () => {
        llmCalls++;
        return JSON.stringify({
          title: "나무가 불을 만나면",
          body: "첫 문단 내용이 충분히 길어야 zod 검증을 통과한다. 두 사람의 오행이 상생 관계라면 나무가 불을 키우고, 불은 다시 나무의 시간을 바꾼다.\n\n둘째 문단. 다만 젖은 날엔 애를 먹는다. 그래도 봄의 한복판은 아니어도 저녁의 온도는 맞는 관계다.\n\n셋째 문단. 서두르지 말 것. 천천히 서로의 연료가 되어가는 것으로 충분하다.",
          pullQuote: "너희는 서로에게 연료이자 불씨다",
        });
      }),
    });
  });

  it("returns hash on valid input", async () => {
    const res = await POST(req(VALID));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.hash).toMatch(/^[0-9A-Za-z]{8}$/);
  });

  it("caches: same input twice = 1 LLM call", async () => {
    await POST(req(VALID));
    await POST(req(VALID));
    expect(llmCalls).toBe(1);
  });

  it("is order-invariant: (A,B) and (B,A) share hash and cache", async () => {
    const r1 = await POST(req(VALID));
    const r2 = await POST(req({ a: VALID.b, b: VALID.a }));
    const h1 = (await r1.json()).hash;
    const h2 = (await r2.json()).hash;
    expect(h1).toBe(h2);
    expect(llmCalls).toBe(1);
  });

  it("returns 400 on bad mbti", async () => {
    const bad = { ...VALID, a: { ...VALID.a, mbti: "XXXX" } };
    const res = await POST(req(bad));
    expect(res.status).toBe(400);
  });

  it("returns 400 on date out of range", async () => {
    const bad = { ...VALID, a: { ...VALID.a, birth: "1700-01-01" } };
    const res = await POST(req(bad));
    expect(res.status).toBe(400);
  });

  it("returns 429 after 10 requests from same IP", async () => {
    for (let i = 0; i < 10; i++) {
      const body = { ...VALID, a: { ...VALID.a, birth: `199${i % 10}-03-12` } };
      await POST(req(body));
    }
    const res = await POST(req({ ...VALID, a: { ...VALID.a, birth: "1980-03-12" } }));
    expect(res.status).toBe(429);
  });
});
