import type { TimePoint } from "@/lib/types";

export default function TimelineCards({ timeline }: { timeline: TimePoint[] }) {
  return (
    <div className="my-8">
      <div className="text-[10px] tracking-[0.2em] text-muted uppercase text-center mb-3">
        관계의 달력
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {timeline.map((t, i) => (
          <div key={i} className="border border-line p-4 rounded-sm">
            <div className="text-[10px] tracking-[0.15em] text-accent uppercase mb-2 flex items-center gap-2">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-accent" />
              {t.when}
            </div>
            <p className="text-[13px] text-ink leading-relaxed mb-3">
              {t.mood}
            </p>
            <p className="text-[11px] text-muted leading-snug pt-2 border-t border-line">
              <span className="text-accent">→ </span>
              {t.action}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
