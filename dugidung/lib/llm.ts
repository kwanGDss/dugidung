import { z } from "zod";
import OpenAI from "openai";
import type { Letter, MBTI, Pillars, Score } from "@/lib/types";
import { PROMPT_VERSION, SYSTEM_PROMPT, buildUserPrompt } from "@/lib/prompts";
import { fallbackLetter } from "@/data/fallback-letters";

const LetterSchema = z.object({
  title: z.string().min(3).max(30),
  body: z.string().min(100).max(1200),
  pullQuote: z.string().min(8).max(60),
});

export interface GenerateArgs {
  a: { birth: string; mbti: MBTI; pillars: Pillars };
  b: { birth: string; mbti: MBTI; pillars: Pillars };
  score: Score;
}

export interface Caller {
  call: (system: string, user: string, temperature: number) => Promise<string>;
}

function openaiCaller(): Caller["call"] {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return async (system, user, temperature) => {
    const res = await client.chat.completions.create(
      {
        model: "gpt-4o-mini",
        temperature,
        max_completion_tokens: 900,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      },
      { timeout: 20_000 },
    );
    return res.choices[0]?.message?.content ?? "";
  };
}

function parse(raw: string): Letter | null {
  try {
    const obj = JSON.parse(raw);
    const parsed = LetterSchema.safeParse(obj);
    if (!parsed.success) return null;
    return { ...parsed.data, promptVersion: PROMPT_VERSION, source: "llm" };
  } catch {
    return null;
  }
}

export async function generateLetter(
  args: GenerateArgs,
  deps: Partial<Caller> = {},
): Promise<Letter> {
  const call = deps.call ?? openaiCaller();
  const user = buildUserPrompt(args);

  try {
    const raw1 = await call(SYSTEM_PROMPT, user, 0.7);
    const parsed1 = parse(raw1);
    if (parsed1) return parsed1;
  } catch {
    /* fall through to retry */
  }

  try {
    const raw2 = await call(SYSTEM_PROMPT, user, 0.5);
    const parsed2 = parse(raw2);
    if (parsed2) return parsed2;
  } catch {
    /* fall through to fallback */
  }

  const fb = fallbackLetter(args.score.total);
  return { ...fb, promptVersion: PROMPT_VERSION, source: "fallback" };
}
