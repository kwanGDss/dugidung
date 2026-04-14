import type { Score } from "@/lib/types";

const LABELS: Record<keyof Score["dimensions"], string> = {
  ohaeng: "오행",
  zodiac: "십이지",
  mbti: "MBTI",
};

export default function DimensionBars({ dimensions }: { dimensions: Score["dimensions"] }) {
  return (
    <div className="py-7 my-11 border-y border-line flex flex-col gap-[18px]">
      {(Object.keys(LABELS) as (keyof Score["dimensions"])[]).map((key) => {
        const v = dimensions[key];
        return (
          <div key={key} className="flex items-center gap-[18px] text-sm text-muted">
            <div className="w-16 text-right text-[11px] uppercase tracking-[0.15em]">
              {LABELS[key]}
            </div>
            <div className="flex-1 h-[2px] bg-line relative">
              <div
                className="absolute inset-y-0 left-0 bg-accent"
                style={{
                  width: `${v}%`,
                  boxShadow: "0 0 6px rgba(212,182,120,0.5)",
                }}
              />
            </div>
            <div className="w-8 tabular-nums text-ink">{v}</div>
          </div>
        );
      })}
    </div>
  );
}
