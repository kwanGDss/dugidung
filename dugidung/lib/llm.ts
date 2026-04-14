import { z } from "zod";
import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import type { Letter, MBTI, Pillars, Score } from "@/lib/types";
import { PROMPT_VERSION, SYSTEM_PROMPT, buildUserPrompt } from "@/lib/prompts";
import { fallbackLetter } from "@/data/fallback-letters";

const LetterSchema = z.object({
  title: z.string().min(3).max(30),
  body: z.string().min(100).max(1200),
  pullQuote: z.string().min(8).max(60),
});

export interface GenerateArgs {
  a: { birth: string; mbti: MBTI | null; pillars: Pillars };
  b: { birth: string; mbti: MBTI | null; pillars: Pillars };
  score: Score;
}

export interface Caller {
  call: (system: string, user: string, temperature: number) => Promise<string>;
}

function openaiCaller(): Caller["call"] {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";
  return async (system, user, temperature) => {
    const started = Date.now();
    const res = await client.chat.completions.create(
      {
        model,
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
    const elapsed = Date.now() - started;
    const usage = res.usage;
    console.log("[llm] openai", model, {
      ms: elapsed,
      in: usage?.prompt_tokens,
      out: usage?.completion_tokens,
    });
    return res.choices[0]?.message?.content ?? "";
  };
}

function anthropicCaller(): Caller["call"] {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const model = process.env.ANTHROPIC_MODEL ?? "claude-haiku-4-5-20251001";
  return async (system, user, temperature) => {
    const started = Date.now();
    const res = await client.messages.create(
      {
        model,
        max_tokens: 900,
        temperature,
        system: [
          {
            type: "text",
            text: system,
            cache_control: { type: "ephemeral" },
          },
        ],
        messages: [
          {
            role: "user",
            content: `${user}\n\n반드시 아래 형태의 JSON 하나만 출력하라. 앞뒤에 어떤 설명이나 코드블록도 붙이지 말 것.\n\n{"title":"...","body":"...","pullQuote":"..."}`,
          },
        ],
      },
      { timeout: 20_000 },
    );
    const elapsed = Date.now() - started;
    console.log("[llm] anthropic", model, {
      ms: elapsed,
      in: res.usage.input_tokens,
      out: res.usage.output_tokens,
      cache_read: res.usage.cache_read_input_tokens ?? 0,
      cache_create: res.usage.cache_creation_input_tokens ?? 0,
    });
    const first = res.content[0];
    if (!first || first.type !== "text") return "";
    return first.text.trim();
  };
}

function providerCaller(): Caller["call"] {
  const provider = (process.env.LLM_PROVIDER ?? "openai").toLowerCase();
  if (provider === "anthropic") return anthropicCaller();
  return openaiCaller();
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
  const call = deps.call ?? providerCaller();
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
