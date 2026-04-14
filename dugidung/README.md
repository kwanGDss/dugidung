# 두기둥 (dugidung)

커플 궁합 웹사이트 — 두 사람의 생년월일 + MBTI 로 일간 오행 + 12지 + MBTI 3축 가중합 점수를 내고, gpt-4o-mini가 편지 한 편으로 풀어주는 Next.js 앱.

## Setup

```bash
cp .env.local.example .env.local
# fill in OPENAI_API_KEY and Vercel KV credentials
npm install
npm run dev
```

## Scripts

- `npm run dev` — 개발 서버
- `npm run build` — 프로덕션 빌드
- `npm run test` — vitest 단위/통합 테스트
- `npm run typecheck` — tsc --noEmit

## 구조

- `lib/saju.ts` · `lib/score.ts` · `lib/hash.ts` — 순수 계산 코어 (TDD)
- `lib/llm.ts` · `lib/kv.ts` · `lib/rate-limit.ts` — I/O 래퍼
- `lib/compat-deps.ts` — 라우트 DI 상태
- `app/api/compat/route.ts` — 오케스트레이션
- `app/r/[hash]/page.tsx` — 결과 페이지 (+ opengraph-image.tsx)

## Deploy

Vercel. Project 연결 후 env 변수 세팅:
- `OPENAI_API_KEY`
- `KV_URL`, `KV_REST_API_URL`, `KV_REST_API_TOKEN`, `KV_REST_API_READ_ONLY_TOKEN`
- `NEXT_PUBLIC_SITE_URL` (e.g. `https://dugidung.vercel.app`)

KV는 Vercel 대시보드에서 새 KV 스토리지를 만들어 프로젝트에 연결.

## 설계 문서

`../docs/superpowers/specs/2026-04-14-dugidung-design.md`
`../docs/superpowers/plans/2026-04-14-dugidung.md`
