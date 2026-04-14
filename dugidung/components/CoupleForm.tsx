"use client";
import { useState, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import LoadingOverlay from "@/components/LoadingOverlay";

type Axis = "EI" | "NS" | "TF" | "JP";
type Person = {
  name: string;
  y: string; // 4자리 년도
  m: string; // 1~2자리 월
  d: string; // 1~2자리 일
  mbti: string[];
  mbtiUnknown: boolean;
};

const EMPTY: Person = {
  name: "",
  y: "", m: "", d: "",
  mbti: ["E", "N", "F", "J"],
  mbtiUnknown: false,
};
const LETTERS: Record<Axis, [string, string]> = {
  EI: ["E", "I"], NS: ["N", "S"], TF: ["T", "F"], JP: ["J", "P"],
};

function mbtiString(m: string[]): string {
  return m.join("");
}

/** y/m/d 3-segment 를 "YYYY-MM-DD" 로 합친다. 유효성 검증 X (서버에서) */
function composeBirth(p: Person): string | null {
  const y = p.y.trim();
  const m = p.m.trim();
  const d = p.d.trim();
  if (!/^\d{4}$/.test(y)) return null;
  if (!/^\d{1,2}$/.test(m)) return null;
  if (!/^\d{1,2}$/.test(d)) return null;
  const mm = m.padStart(2, "0");
  const dd = d.padStart(2, "0");
  return `${y}-${mm}-${dd}`;
}

function PersonFields({ label, value, onChange }: {
  label: string;
  value: Person;
  onChange: (p: Person) => void;
}) {
  const yRef = useRef<HTMLInputElement>(null);
  const mRef = useRef<HTMLInputElement>(null);
  const dRef = useRef<HTMLInputElement>(null);

  function toggle(idx: number, pair: [string, string]) {
    if (value.mbtiUnknown) return;
    const next = [...value.mbti];
    next[idx] = next[idx] === pair[0] ? pair[1] : pair[0];
    onChange({ ...value, mbti: next });
  }

  // 숫자만 허용 + 길이 제한 + 꽉 차면 다음 칸으로 auto-advance
  function handleDigit(
    field: "y" | "m" | "d",
    maxLen: number,
    nextRef: React.RefObject<HTMLInputElement | null> | null,
  ) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value.replace(/\D/g, "").slice(0, maxLen);
      onChange({ ...value, [field]: raw });
      if (raw.length === maxLen && nextRef?.current) {
        nextRef.current.focus();
      }
    };
  }

  return (
    <fieldset className="border border-line p-5 space-y-4">
      <legend className="text-xs tracking-[0.2em] text-muted px-2">{label}</legend>
      <div>
        <label className="block text-xs text-muted mb-1">이름 (선택)</label>
        <input
          className="w-full bg-transparent border-b border-line py-2 text-ink focus:border-accent outline-none"
          value={value.name}
          onChange={(e) => onChange({ ...value, name: e.target.value })}
          maxLength={20}
        />
      </div>
      <div>
        <label className="block text-xs text-muted mb-1">생년월일</label>
        <div className="flex items-center gap-2">
          <input
            ref={yRef}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="YYYY"
            aria-label="년도"
            className="w-20 bg-transparent border-b border-line py-2 text-ink text-center tracking-wider focus:border-accent outline-none"
            value={value.y}
            onChange={handleDigit("y", 4, mRef)}
            maxLength={4}
          />
          <span className="text-muted">·</span>
          <input
            ref={mRef}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="MM"
            aria-label="월"
            className="w-12 bg-transparent border-b border-line py-2 text-ink text-center tracking-wider focus:border-accent outline-none"
            value={value.m}
            onChange={handleDigit("m", 2, dRef)}
            maxLength={2}
          />
          <span className="text-muted">·</span>
          <input
            ref={dRef}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="DD"
            aria-label="일"
            className="w-12 bg-transparent border-b border-line py-2 text-ink text-center tracking-wider focus:border-accent outline-none"
            value={value.d}
            onChange={handleDigit("d", 2, null)}
            maxLength={2}
          />
        </div>
      </div>
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs text-muted">MBTI</label>
          <label className="text-xs text-muted flex items-center gap-1.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={value.mbtiUnknown}
              onChange={(e) => onChange({ ...value, mbtiUnknown: e.target.checked })}
              className="accent-accent cursor-pointer"
            />
            모름
          </label>
        </div>
        <div
          className={`flex gap-2 transition-opacity ${
            value.mbtiUnknown ? "opacity-30 pointer-events-none" : ""
          }`}
          aria-disabled={value.mbtiUnknown}
        >
          {(["EI", "NS", "TF", "JP"] as Axis[]).map((ax, i) => {
            const [l, r] = LETTERS[ax];
            const active = value.mbti[i];
            return (
              <button
                type="button"
                key={ax}
                onClick={() => toggle(i, LETTERS[ax])}
                tabIndex={value.mbtiUnknown ? -1 : 0}
                className="flex-1 border border-line py-2 text-sm hover:border-accent"
              >
                <span className={active === l ? "text-accent" : "text-muted"}>{l}</span>
                <span className="mx-1 text-muted">/</span>
                <span className={active === r ? "text-accent" : "text-muted"}>{r}</span>
              </button>
            );
          })}
        </div>
      </div>
    </fieldset>
  );
}

export default function CoupleForm() {
  const [a, setA] = useState<Person>(EMPTY);
  const [b, setB] = useState<Person>(EMPTY);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const birthA = composeBirth(a);
    const birthB = composeBirth(b);
    if (!birthA || !birthB) {
      setError("두 사람의 생년월일을 숫자로 입력해 주세요. (예: 1995 · 03 · 12)");
      return;
    }
    startTransition(async () => {
      const res = await fetch("/api/compat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          a: {
            birth: birthA,
            mbti: a.mbtiUnknown ? null : mbtiString(a.mbti),
            name: a.name || undefined,
          },
          b: {
            birth: birthB,
            mbti: b.mbtiUnknown ? null : mbtiString(b.mbti),
            name: b.name || undefined,
          },
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(
          body.error === "date_out_of_range" ? "지원 범위를 벗어난 생년월일입니다."
          : body.error === "rate_limited"    ? "잠시 후 다시 시도해 주세요."
          : "입력을 확인해 주세요.",
        );
        return;
      }
      const { hash } = await res.json();
      router.push(`/r/${hash}`);
    });
  }

  return (
    <>
      <LoadingOverlay open={pending} />
      <form onSubmit={submit} className="max-w-2xl w-full space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <PersonFields label="A" value={a} onChange={setA} />
          <PersonFields label="B" value={b} onChange={setB} />
        </div>
        {error && <p className="text-sm text-accent text-center">{error}</p>}
        <div className="text-center">
          <button
            type="submit"
            disabled={pending}
            className="px-8 py-3 border border-accent text-accent hover:bg-accent/10 disabled:opacity-60"
          >
            {pending ? "...기둥을 겹치는 중" : "기둥을 겹치다"}
          </button>
        </div>
      </form>
    </>
  );
}
