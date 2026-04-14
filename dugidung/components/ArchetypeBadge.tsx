import type { Archetype } from "@/lib/types";

export default function ArchetypeBadge({ archetype }: { archetype: Archetype }) {
  return (
    <div className="my-7 py-6 px-6 border-y border-line text-center">
      <div className="text-[11px] tracking-[0.25em] text-muted uppercase mb-2">
        우리의 유형
      </div>
      <div className="text-[26px] text-accent leading-tight mb-3">
        {archetype.name}
      </div>
      <p className="text-[13px] text-ink/80 leading-relaxed max-w-sm mx-auto">
        {archetype.description}
      </p>
    </div>
  );
}
