import { z } from "zod";
import type { CompatRecord, Inputs } from "@/lib/types";
import { birthToPillars, BirthOutOfRangeError } from "@/lib/saju";
import { computeScore } from "@/lib/score";
import { hashInputs } from "@/lib/hash";
import { defaultStore, type Store } from "@/lib/kv";
import { generateLetter, type Caller } from "@/lib/llm";
import { checkRateLimit } from "@/lib/rate-limit";

const MBTI = /^[EI][NS][TF][JP]$/;
const PersonSchema = z.object({
  birth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  mbti: z.string().regex(MBTI),
  name: z.string().max(20).optional(),
});
const BodySchema = z.object({ a: PersonSchema, b: PersonSchema });

type Deps = { store: Store; call?: Caller["call"] };
let DEPS: Deps = { store: defaultStore() };
export function __setDeps(d: Partial<Deps>) {
  DEPS = { ...DEPS, ...d };
}

function ipOf(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  return (xff?.split(",")[0] ?? "unknown").trim();
}

function json(data: unknown, init?: ResponseInit): Response {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: { "content-type": "application/json", ...(init?.headers ?? {}) },
  });
}

export async function POST(req: Request): Promise<Response> {
  const store = DEPS.store;
  const ip = ipOf(req);

  if (!(await checkRateLimit(ip, store, 10, 60))) {
    return json({ error: "rate_limited" }, { status: 429, headers: { "retry-after": "60" } });
  }

  let parsed;
  try {
    parsed = BodySchema.parse(await req.json());
  } catch {
    return json({ error: "invalid_input" }, { status: 400 });
  }

  const a: Inputs = { ...parsed.a, mbti: parsed.a.mbti.toUpperCase() };
  const b: Inputs = { ...parsed.b, mbti: parsed.b.mbti.toUpperCase() };

  const hash = hashInputs(a, b);
  const cacheKey = `compat:${hash}`;

  const cached = await store.get<CompatRecord>(cacheKey);
  if (cached) return json({ hash });

  let pillarsA, pillarsB;
  try {
    pillarsA = birthToPillars(a.birth);
    pillarsB = birthToPillars(b.birth);
  } catch (err) {
    if (err instanceof BirthOutOfRangeError) {
      return json({ error: "date_out_of_range" }, { status: 400 });
    }
    return json({ error: "invalid_input" }, { status: 400 });
  }

  const score = computeScore(pillarsA, pillarsB, a.mbti, b.mbti);
  const letter = await generateLetter(
    { a: { birth: a.birth, mbti: a.mbti, pillars: pillarsA },
      b: { birth: b.birth, mbti: b.mbti, pillars: pillarsB },
      score },
    DEPS.call ? { call: DEPS.call } : {},
  );

  const record: CompatRecord = {
    version: 1,
    hash,
    createdAt: new Date().toISOString(),
    inputs: { a, b },
    pillars: { a: pillarsA, b: pillarsB },
    score,
    letter,
  };

  try {
    await store.set(cacheKey, record);
  } catch (err) {
    console.error("kv set failed", { hash, err });
  }

  return json({ hash });
}
