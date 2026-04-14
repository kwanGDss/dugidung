# 두기둥 (dugidung) — 설계 문서

- 생성일: 2026-04-14
- 상태: 승인 대기
- 선행 프로젝트: [사주보자](https://sajuboja.vercel.app) (동일 제작자, 톤 계승)

## 한 줄 요약

두 사람의 생년월일 + MBTI 를 받아, **일간(日干) 오행 + 12지 + MBTI** 3축 가중합으로 궁합 점수를 내고, gpt-4o-mini 가 "편지 한 편"으로 풀어 보여주는 커플 궁합 웹사이트. 결과는 짧은 영구 URL(`/r/<hash>`) 로 공유되며, 카톡·X 링크 미리보기용 OG 카드가 자동 생성된다.

## 목적

- 친구·지인에게 공유했을 때 "우리 해봤다 ㅋㅋ" 가 되는 가벼운 바이럴 프로젝트
- 사주보자의 톤·팬층을 자연스럽게 재활용
- 단순·빠른 개발 (라이트 스펙으로 2~3일 내 배포 가능한 범위)

## 비목표

- 사주 전문 해석 서비스 (깊이는 의도적으로 포기)
- 계정·로그인·히스토리 대시보드
- 결제·프리미엄 기능
- 모바일 앱

---

## 1. 아키텍처

```
[사용자 브라우저]
   │  (두 사람 생년월일 + MBTI 입력)
   ▼
[Next.js App Router / Vercel]
   ├─ /              랜딩
   ├─ /form          두 사람 입력 폼
   ├─ /r/[hash]      결과 편지 화면
   ├─ /api/compat    POST — 입력 → 해시 → (캐시 hit 반환 / miss면 계산+LLM+저장)
   └─ /r/[hash]/opengraph-image  동적 OG 카드 (@vercel/og)
        │
        ▼
[Vercel KV]    key: compat:<hash>    value: CompatRecord
        ▲
        │
[핵심 모듈]
   ├─ lib/saju.ts       lunar-javascript → 연/월/일주(60갑자) + 일간 오행
   ├─ lib/score.ts      오행 × 12지 × MBTI → 차원 점수 + 총점
   ├─ lib/llm.ts        OpenAI gpt-4o-mini, JSON 강제, 폴백
   ├─ lib/prompts.ts    편지 프롬프트 템플릿 (버전 관리)
   ├─ lib/hash.ts       입력 정규화 + SHA-256 → Base62 8자
   └─ lib/kv.ts         Vercel KV 래퍼
```

**불변식:**
- 동일 입력 → 동일 해시 → 동일 결과 (LLM 호출 1회, 이후 캐시 재사용)
- 커플 순서 교환 시에도 같은 해시 (`(A,B) === (B,A)`)
- 모든 계산 함수(`saju`, `score`, `hash`) 는 순수 함수

---

## 2. 데이터 모델

### KV 스키마

**Key:** `compat:<hash>` (Base62, 8자)

**Value (`CompatRecord`):**
```ts
{
  version: 1,
  hash: "aB3xK9mP",
  createdAt: "2026-04-14T00:30:00Z",

  inputs: {
    a: { birth: "1995-03-12", mbti: "INFP", name?: "가" },
    b: { birth: "1996-08-21", mbti: "ESTJ", name?: "나" }
  },

  pillars: {
    // element 는 일간(日干)의 오행 — 한 사람의 대표 오행으로 사용
    // zodiac 은 연지(年支) — 12간지 차원에서 사용
    a: { year: "을해", month: "기묘", day: "갑자", zodiac: "돼지", element: "목" },
    b: { year: "병자", month: "병신", day: "정유", zodiac: "쥐",   element: "화" }
  },

  score: {
    total: 73,
    dimensions: { ohaeng: 90, zodiac: 65, mbti: 70 }
  },

  letter: {
    title: "나무가 불을 만나면",
    body: "...",
    pullQuote: "너희는 서로에게 연료이자 불씨입니다.",
    promptVersion: "1.0",
    source: "llm" | "fallback"
  }
}
```

**보조 키 (선택):** `compat:recent` — 최근 100개 해시 리스트. 없어도 동작. 초기엔 생략.

**TTL:** 없음(무한 보관). 필요해지면 6개월 TTL 추가.

### 입력 정규화 (해시 계산 전)

1. 생년월일: `YYYY-MM-DD`
2. MBTI: 대문자 4자 (`INFP`)
3. **순서 정규화:** 두 사람을 `(birth, mbti)` 문자열 비교로 정렬하여 항상 같은 순서가 먼저 오도록 스왑. 궁합은 대칭이므로 `(A,B)` 와 `(B,A)` 가 같은 해시를 갖는다.
4. 이름은 해시에 포함하지 않음 (표시 전용)

### 해시

```
canonicalize → JSON.stringify → SHA-256 → 앞 48비트 → Base62 → 8자
```

48비트 ≈ 16만 건 저장 시 1% 충돌. 초기 규모에 넉넉. 필요 시 64비트(10자)로 확장.

---

## 3. 파일 구조

```
dugidung/
├─ app/
│  ├─ layout.tsx
│  ├─ page.tsx                     / 랜딩
│  ├─ form/page.tsx                /form
│  ├─ r/[hash]/
│  │  ├─ page.tsx                  /r/<hash>
│  │  └─ opengraph-image.tsx       OG 이미지
│  ├─ error.tsx                    전역 에러 바운더리
│  ├─ not-found.tsx                404
│  └─ api/compat/route.ts          POST /api/compat
│
├─ lib/
│  ├─ saju.ts                      lunar-javascript 래핑
│  ├─ score.ts                     점수 계산 (순수)
│  ├─ llm.ts                       OpenAI 호출 + 폴백
│  ├─ prompts.ts                   프롬프트 템플릿 + 버전
│  ├─ hash.ts                      입력 정규화 + 해시
│  ├─ kv.ts                        Vercel KV 래퍼
│  └─ types.ts                     공용 타입
│
├─ components/
│  ├─ Hero.tsx
│  ├─ CoupleForm.tsx               날짜 2개 + MBTI 토글 4쌍 × 2명
│  ├─ ScoreRing.tsx                SVG 도넛 차트
│  ├─ DimensionBars.tsx            3차원 수평 바
│  ├─ LetterView.tsx               편지 본문 렌더
│  └─ ShareBar.tsx                 링크 복사·카톡·X
│
├─ data/
│  ├─ zodiac-compat.ts             12×12 테이블 (삼합/육합/충/원진)
│  ├─ mbti-compat.ts               16×16 테이블 (규칙 생성 + 수동 오버라이드)
│  ├─ ohaeng-rules.ts              상생/상극 규칙
│  └─ fallback-letters.ts          점수 구간별 폴백 편지 4종
│
├─ tests/
│  ├─ hash.test.ts
│  ├─ saju.test.ts
│  ├─ score.test.ts
│  ├─ llm.test.ts
│  └─ integration/compat.test.ts
│
├─ public/
├─ .env.local.example
├─ package.json
├─ tsconfig.json
├─ tailwind.config.ts
└─ next.config.ts
```

**경계 원칙:**
- `lib/saju`, `lib/score`, `lib/hash` 는 I/O 없음 — 단위 테스트 쉬움
- `lib/llm`, `lib/kv` 는 외부 I/O — 얇게 유지
- `app/api/compat/route.ts` 는 오케스트레이션만 (파싱 → 해시 → KV → 계산 → 저장)
- `data/*` 테이블은 코드와 분리 — 튜닝 diff 가 깔끔

### 의존성

프로덕션:
```
next react react-dom
tailwindcss
@vercel/kv
@vercel/og
openai
lunar-javascript
zod
```

개발:
```
typescript @types/*
vitest @testing-library/react
```

---

## 4. 점수 로직

세 차원을 각각 0~100으로 계산 후 가중합.

### 4-1. 오행(五行)

두 사람의 **일간(日干) 오행** 비교. (일주 = 일간+일지인데, 대표 오행은 전통적으로 일간 기준.)

| 관계 | 점수 |
|---|---|
| 같음(비화) | 70 |
| 상생(順) A→B | 90 |
| 상생(逆) B→A | 88 |
| 상극(順) A→B | 45 |
| 상극(逆) B→A | 42 |

```ts
const SHENG = { 목: "화", 화: "토", 토: "금", 금: "수", 수: "목" };
const KE    = { 목: "토", 토: "수", 수: "화", 화: "금", 금: "목" };
```

### 4-2. 12간지

두 사람의 **연지(年支)** 기준.

| 관계 | 점수 |
|---|---|
| 삼합 | 95 |
| 육합 | 90 |
| 같음 | 75 |
| 무관 | 65 |
| 원진 | 40 |
| 육충 | 35 |

구현: `data/zodiac-compat.ts` 에 12×12 선계산 테이블.

### 4-3. MBTI

16×16 테이블. 규칙 기반 초기값 + 수동 오버라이드.

**규칙 (기저 55):**
- N/S 같음 +15, 다름 −5
- E/I 다름 +10, 같음 +5
- T/F 같음 +10, 다름 +5
- J/P 다름 +5, 같음 +10

**수동 오버라이드 예:** INTJ-ESFP −5, INFP-ENFJ +3 등. `data/mbti-compat.ts` 오버라이드 맵으로 관리.

### 4-4. 최종 점수

```ts
total = round(ohaeng * 0.45 + zodiac * 0.25 + mbti * 0.30)
```

**가중치 근거:**
- 오행 45%: "사주다움" 지분, 변별력의 핵심
- MBTI 30%: 유저가 즉각 공감하는 축
- 12지 25%: 같은 해 태생은 동일 → 보조 축

예상 범위: 대략 **45 ~ 92**. 의도적으로 100점 만점 느낌을 피함.

### 4-5. 결정성

모든 계산은 순수. 랜덤 요소 없음. LLM 편지만 `temperature: 0.7`이지만 결과는 KV 에 저장 후 고정되므로 재조회 시에도 동일.

### 4-6. 튜닝

1. 지인 10쌍 베타 → 점수 분포 확인 (평균 65~70, 표준편차 10~12 목표)
2. 편향 시 가중치/기저점 조정
3. `tests/score.test.ts` 에 대표 10쌍 스냅샷 고정 → 회귀 방지

---

## 5. LLM 편지 생성

### 5-1. 호출

```ts
model: "gpt-4o-mini"
temperature: 0.7
max_tokens: 900
response_format: { type: "json_object" }
timeout: 20000
retry: 1회, 1s backoff
```

### 5-2. 프롬프트 (요지)

**System:**
```
당신은 "두기둥"이라는 커플 궁합 편지 작가입니다.
사주의 오행과 12지, MBTI를 근거로 두 사람에게 건네는 짧은 편지를 씁니다.

톤:
- 명상적이고 따뜻하되, 감상에 빠지지 않는다.
- 한국어, 담담한 평어체("~이다", "~한다").
- 비유는 자연물(계절·물·나무·불·바람) 우선. 별·운명 같은 상투어 금지.
- 점수가 낮아도 부정하지 않고 "어떤 계절"로 번역한다.

금지:
- "천생연분", "영혼의 단짝" 같은 클리셰
- 이모지, 마크다운, 예언조("~할 것입니다")
```

**User:**
두 사람의 생년월일·MBTI·일주·오행·관계·점수를 전부 전달하고, 다음 JSON 스키마로만 답하라고 지시:

```json
{
  "title": "string (5~12자)",
  "body": "string (3문단, 각 2~4문장, \\n\\n 구분)",
  "pullQuote": "string (25자 내외, body에 없는 새 문장)"
}
```

본문 구성:
1. 첫 문단: 오행/기질이 만나는 장면
2. 둘째 문단: 관계의 긴장·균형·계절
3. 셋째 문단: 살아가는 태도에 대한 한마디

### 5-3. 검증 (`zod`)

```ts
LetterSchema = {
  title: z.string().min(3).max(30),
  body: z.string().min(100).max(1200),
  pullQuote: z.string().min(8).max(60),
}
```

### 5-4. 폴백

검증 실패 → temperature 0.5로 1회 재시도 → 여전히 실패 시 **점수 구간별 폴백 편지** (45-55, 56-70, 71-85, 86+) 에서 선택. 유저 화면엔 빈 편지가 절대 안 뜬다.

폴백 편지 4종은 `data/fallback-letters.ts` 에 커밋.

### 5-5. 프롬프트 버전

`PROMPT_VERSION = "1.0"` 상수. KV 레코드의 `letter.promptVersion` 에 저장. 프롬프트 개선 시 버전 올리고 기존 레코드는 그대로 유지(일관성 우선).

### 5-6. 비용

gpt-4o-mini 기준 쌍 1건당 ≈ **$0.0003 (0.4원)**. 캐시 히트는 무료. 1000쌍 ≈ 400원.

---

## 6. UI · 비주얼

### 6-1. 방향: **야경 다크 · 골드 포인트**

| 축 | 값 |
|---|---|
| 배경 | `#0E1324` (짙은 남) |
| 배경 보조 | `#151B30` |
| 잉크 | `#F4E9CE` (크림 베이지) |
| 뮤트 텍스트 | `#7A8099` |
| 라인 | `#232A42` |
| 악센트 | `#D4B678` (골드) |
| 악센트 dim | `#8A7748` |
| 서체 | Nanum Myeongjo / Noto Serif KR (명조) |
| 장식 | 흐린 별 질감(radial-gradient 점 6~8개), 골드 글로우(box-shadow) |
| 대표 한자 | 兩 |

**톤 레퍼런스:** 밤하늘 + 서예 + 금박. 사주보자의 "산 / 먹 / 여백" 을 "야경 / 금 / 여백" 으로 변주.

### 6-2. 화면별

**/ 랜딩**
- 가운데 "兩" 또는 두 원이 겹쳐지는 SVG 마크 (골드 선)
- 헤드카피: "두 기둥을 겹쳐봅니다"
- 서브카피: "두 사람의 사주와 기질이 만나는 자리"
- CTA: "시작하기" 밑줄 텍스트 링크
- 배경 미세 별 질감

**/form**
- 두 열(모바일은 세로 스택)
- 이름(선택) · `<input type="date">` · MBTI 4쌍 이분 토글 (E↔I, N↔S, T↔F, J↔P)
- 제출: "기둥을 겹치다"
- 로딩: 버튼이 "...기둥을 겹치는 중" + 점 3개 애니메이션
- 커스텀 날짜 피커 금지 (YAGNI — 네이티브 사용)

**/r/[hash] — 레이아웃 V1 (중앙 스코어 세로 스택)**

위에서 아래로:

1. 브랜드 타이틀 "兩 · 두 기 둥" (뮤트, 자간 넓게)
2. **도넛 스코어** 200px, 골드 73% + 라인 27%, 중앙 큰 숫자(62px 크림)
3. 편지 제목(28px, 골드)
4. 상하 보더(#232A42) 사이 **3차원 바** (오행/십이지/MBTI), 각 레이블 · 트랙 · 숫자
5. 편지 본문 3문단 (17px, 행간 1.85, 크림)
6. 구분선 — 두 사람 요약 (뮤트, 작게): "A · 날짜 · 일주 오행 · MBTI"
7. 공유 바: [링크 복사] [카카오톡] [X] — 골드 밑줄 텍스트 링크
8. 하단 CTA "— 우리도 해보기 —" → `/form`

### 6-3. 공유카드 (OG 이미지)

`app/r/[hash]/opengraph-image.tsx` — Next.js 규약.

사양:
- 1200 × 630
- 배경 `#0E1324` + 큰 별 점 질감
- 좌측 42%: 도넛 스코어(원본보다 큼) + "兩 · 두 기 둥" 브랜드
- 우측 58%: `pullQuote` 한 문장, 골드 「」 감싸기
- 우하단: `dugidung.vercel.app` (시스템 sans, 뮤트)
- `runtime: "edge"` + 해시별 자동 Edge 캐시

### 6-4. 메타태그

`/r/[hash]/page.tsx` 의 `generateMetadata` 에서 KV 조회 후 title/description/OG/twitter:card 세팅. 카톡·X 링크 미리보기가 **바이럴 메커니즘의 핵심**이므로 가장 공들일 부분.

### 6-5. 접근성·반응형

- 모바일 퍼스트 (주 사용처 카톡 링크 클릭)
- 본문 최소 17px, 탭 타겟 충분
- `prefers-color-scheme` 무시 — 다크 고정 (이 디자인의 핵심이 다크)
- 스코어 원형 `aria-label="궁합 점수 73점"`
- 별 질감은 순수 CSS (이미지 리소스 없음)

---

## 7. 에러 처리 · 테스트

### 7-1. 에러 처리

| 단계 | 실패 | 처리 |
|---|---|---|
| 입력 zod 검증 | 포맷 불량 | 400 + `{ error, field }`, 해당 필드 강조 |
| KV get | KV 다운 | 503 + "잠시 후 다시 시도" |
| `saju.ts` | 범위 밖 날짜(1900년 이전 등) | 400 + `date_out_of_range` |
| `score.ts` | — | 실패 없음 |
| `llm.ts` 호출 | 타임아웃/5xx/레이트 | 1회 재시도 → 실패 시 폴백 편지, `letter.source: "fallback"` |
| `llm.ts` 파싱 | JSON 규약 위반 | temperature 낮춰 재시도 → 실패 시 폴백 |
| KV set | 드물게 실패 | 조용히 삼키고 응답 (다음 호출 시 재생성), 로그만 |
| `/r/<hash>` miss | 없는 해시 | `not-found.tsx` "기둥을 찾지 못했습니다" + `/form` 링크 |

**원칙:** 유저에게 빈 화면/에러 페이지 절대 노출 금지. 최후엔 폴백 편지로라도 완성된 결과 제공.

### 7-2. 레이트 리미트

`/api/compat` 만: Vercel KV INCR + 60s TTL. **10 req/min/ip** 초과 시 429 + `Retry-After`. `GET /r/<hash>` 는 캐시 히트라 제한 없음.

### 7-3. 테스트

**단위 (vitest):**
- `hash.test.ts` — 정규화, 순서 독립성, 1000 샘플 충돌 없음
- `saju.test.ts` — 알려진 날짜 10~15건, 양/음력 경계, 범위 밖 에러
- `score.test.ts` — 각 차원 관계별 샘플, 가중합 범위, 대표 10쌍 스냅샷
- `llm.test.ts` — 정상 파싱, 재시도, 폴백 선택

**통합:**
- `tests/integration/compat.test.ts` — POST 동일 입력 2회 → LLM 1회만 호출 (캐시 동작)

**E2E:** 초기 생략. 베타 이후 playwright 로 `/form` → `/r/<hash>` 왕복.

### 7-4. 수동 QA (베타 전)

- [ ] 같은 두 사람 순서 바꿔 제출 → 같은 URL
- [ ] 동일 URL 다른 브라우저 → 같은 결과
- [ ] 카톡·X 링크 공유 → OG 카드 노출 확인
- [ ] iPhone SE / Galaxy 기본 화면 가독성
- [ ] 1900년 이전 생년월일 → 친절 에러
- [ ] MBTI 4번 탭으로 완성 가능
- [ ] 존재하지 않는 `/r/<hash>` → not-found
- [ ] OpenAI 키 비워 폴백 편지 정상 노출

### 7-5. CI

GitHub Actions: `vitest run`, `tsc --noEmit`, `next build`. Vercel Preview 자동 배포.

---

## 환경변수

```
OPENAI_API_KEY=
KV_URL=
KV_REST_API_URL=
KV_REST_API_TOKEN=
KV_REST_API_READ_ONLY_TOKEN=
```

## 배포

Vercel (사주보자와 동일 플랫폼). 도메인 후보: `dugidung.vercel.app` 또는 별도 구매 도메인.

## 오픈 이슈 (후속)

- 프로젝트 최종 이름 확정 ("두기둥" 가제)
- 로고/마크 "兩" 그래픽 결정
- 도메인 구매 여부
- `compat:recent` 최근 궁합 구경 기능 추가 여부

## 다음 단계

`superpowers:writing-plans` 스킬로 이 설계를 구현 계획(단계별 태스크 · 검증 지점) 으로 변환한다.
