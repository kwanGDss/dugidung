import { z } from "zod";
import type { CompatRecord, Inputs } from "@/lib/types";
import { birthToPillars, BirthOutOfRangeError } from "@/lib/saju";
import { computeScore } from "@/lib/score";
import { hashInputs } from "@/lib/hash";
import { generateLetter } from "@/lib/llm";
import { checkRateLimit } from "@/lib/rate-limit";
import { getStore, getCall } from "@/lib/compat-deps";

const MBTI = /^[EI][NS][TF][JP]$/;
const PersonSchema = z.object({
  birth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  mbti: z.string().regex(MBTI).nullable(),
  name: z.string().max(20).optional(),
});
const BodySchema = z.object({ a: PersonSchema, b: PersonSchema });

function ipOf(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  const real = req.headers.get("x-real-ip");
  if (real) return real.trim();
  return "unknown";
}

function json(data: unknown, init?: ResponseInit): Response {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: { ...(init?.headers ?? {}), "content-type": "application/json" },
  });
}

export async function POST(req: Request): Promise<Response> {
  const store = getStore();
  const ip = ipOf(req);
  const rateLimitKey = `compat:${ip}`;

  try {
    if (!(await checkRateLimit(rateLimitKey, store, 10, 60))) {
      return json({ error: "rate_limited" }, { status: 429, headers: { "retry-after": "60" } });
    }
  } catch (err) {
    console.error("rate limit check failed", { ip, err });
    // fail open — don't lock out on transient KV errors
  }

  let parsed;
  try {
    parsed = BodySchema.parse(await req.json());
  } catch {
    return json({ error: "invalid_input" }, { status: 400 });
  }

  const a: Inputs = { ...parsed.a, mbti: parsed.a.mbti ? parsed.a.mbti.toUpperCase() : null };
  const b: Inputs = { ...parsed.b, mbti: parsed.b.mbti ? parsed.b.mbti.toUpperCase() : null };

  const hash = hashInputs(a, b);
  const cacheKey = `compat:${hash}`;

  let cached: CompatRecord | null;
  try {
    cached = await store.get<CompatRecord>(cacheKey);
  } catch (err) {
    console.error("kv get failed", { hash, err });
    return json({ error: "kv_unavailable" }, { status: 503, headers: { "retry-after": "10" } });
  }
  // Version gate: treat stale-schema records as misses so old caches don't
  // surface v1 data in the v2 result page.
  if (cached && cached.version === 2) return json({ hash });

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
  const call = getCall();
  const letter = await generateLetter(
    { a: { birth: a.birth, mbti: a.mbti, pillars: pillarsA },
      b: { birth: b.birth, mbti: b.mbti, pillars: pillarsB },
      score },
    call ? { call } : {},
  );

  const record: CompatRecord = {
    version: 2,
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
