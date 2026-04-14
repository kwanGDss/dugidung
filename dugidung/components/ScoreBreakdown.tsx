"use client";
import { useState } from "react";
import type { ScoreExplanation } from "@/lib/score-explanation";

export default function ScoreBreakdown({
  total,
  explanation,
}: {
  total: number;
  explanation: ScoreExplanation;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="my-6 border border-line p-4 text-[12px] text-muted">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full text-left text-accent hover:text-ink flex items-center gap-2"
      >
        <span className="inline-block w-3">{open ? "▾" : "▸"}</span>
        이 점수는 어떻게 계산됐나요?
      </button>
      {open && (
        <div className="mt-3 pt-3 border-t border-line space-y-3">
          <div className="font-mono text-[11px] leading-relaxed text-ink whitespace-pre-line">
            {explanation.lines.join("\n")}
            {"\n────────────\n"}
            {`합 ${explanation.rawSum} → 반올림 ${total}`}
          </div>
          <ul className="text-[12px] text-ink space-y-1 list-none">
            {explanation.relations.map((line, i) => (
              <li key={i}>· {line}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
