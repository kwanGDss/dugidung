import type { Distribution } from "@/lib/ohaeng-distribution";
import { ELEMENTS_IN_ORDER } from "@/lib/ohaeng-distribution";

export default function OhaengDistribution({ distribution }: { distribution: Distribution }) {
  const max = Math.max(...Object.values(distribution), 1);
  return (
    <div className="mt-6 mb-4">
      <div className="text-[10px] tracking-[0.2em] text-muted uppercase text-center mb-3">
        두 사람의 오행 분포
      </div>
      <div className="grid grid-cols-5 gap-2 max-w-sm mx-auto">
        {ELEMENTS_IN_ORDER.map((el) => {
          const count = distribution[el];
          const heightPct = (count / max) * 100;
          return (
            <div key={el} className="flex flex-col items-center">
              <div className="text-[11px] text-ink mb-1">{el}</div>
              <div className="w-full h-14 bg-bg-2 relative">
                <div
                  className="absolute left-0 right-0 bottom-0 bg-accent"
                  style={{
                    height: `${Math.max(heightPct, 4)}%`,
                    opacity: count === 0 ? 0.2 : 1,
                  }}
                />
              </div>
              <div className="text-[10px] text-muted mt-1 tabular-nums">{count}</div>
            </div>
          );
        })}
      </div>
      <p className="text-[9px] text-muted/60 text-center mt-2 tracking-wide">
        연·월·일주 기준 · 시주 미포함
      </p>
    </div>
  );
}
