import type { Seasons } from "@/lib/types";

const ROWS: Array<{ key: keyof Seasons; head: string }> = [
  { key: "strength", head: "강점" },
  { key: "tension",  head: "긴장" },
  { key: "advice",   head: "조언" },
];

export default function SeasonCards({ seasons }: { seasons: Seasons }) {
  return (
    <div className="my-8">
      <div className="text-[10px] tracking-[0.2em] text-muted uppercase text-center mb-3">
        관계의 계절
      </div>
      <div className="grid sm:grid-cols-3 gap-3">
        {ROWS.map(({ key, head }) => (
          <div key={key} className="border border-line p-4">
            <div className="text-[11px] tracking-[0.15em] text-accent uppercase mb-2">
              {head}
            </div>
            <p className="text-[13px] text-ink leading-relaxed">
              {seasons[key]}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
