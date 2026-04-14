"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import LoadingOverlay from "@/components/LoadingOverlay";

type Axis = "EI" | "NS" | "TF" | "JP";
type Person = { name: string; birth: string; mbti: string[]; mbtiUnknown: boolean };

const EMPTY: Person = { name: "", birth: "", mbti: ["E", "N", "F", "J"], mbtiUnknown: false };
const LETTERS: Record<Axis, [string, string]> = {
  EI: ["E", "I"], NS: ["N", "S"], TF: ["T", "F"], JP: ["J", "P"],
};

function mbtiString(m: string[]): string {
  return m.join("");
}

function PersonFields({ label, value, onChange }: {
  label: string;
  value: Person;
  onChange: (p: Person) => void;
}) {
  function toggle(idx: number, pair: [string, string]) {
    if (value.mbtiUnknown) return;
    const next = [...value.mbti];
    next[idx] = next[idx] === pair[0] ? pair[1] : pair[0];
    onChange({ ...value, mbti: next });
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
        <input
          type="date"
          className="w-full bg-transparent border-b border-line py-2 text-ink focus:border-accent outline-none"
          value={value.birth}
          min="1900-01-01"
          max={new Date().toISOString().slice(0, 10)}
          onChange={(e) => onChange({ ...value, birth: e.target.value })}
          required
        />
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
    if (!a.birth || !b.birth) {
      setError("두 사람의 생년월일을 모두 입력해 주세요.");
      return;
    }
    startTransition(async () => {
      const res = await fetch("/api/compat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          a: {
            birth: a.birth,
            mbti: a.mbtiUnknown ? null : mbtiString(a.mbti),
            name: a.name || undefined,
          },
          b: {
            birth: b.birth,
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
