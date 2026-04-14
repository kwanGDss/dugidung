import type { Inputs, Pillars } from "@/lib/types";

function Card({ label, inputs, pillars }: { label: string; inputs: Inputs; pillars: Pillars }) {
  return (
    <div className="border border-line p-4 text-center">
      <div className="text-[10px] tracking-[0.2em] text-muted uppercase mb-1">
        {label}
      </div>
      {inputs.name && (
        <div className="text-[11px] text-muted mb-2">{inputs.name}</div>
      )}
      <div className="text-[32px] text-accent leading-none my-2 tracking-tight">
        {pillars.day}
      </div>
      <div className="text-[11px] text-muted mt-1">
        {pillars.element} 일간 · {pillars.zodiac}띠
      </div>
      <div className="text-[10px] text-muted/70 mt-1">
        {inputs.birth}
      </div>
    </div>
  );
}

export default function PillarCards({
  a,
  b,
  inputsA,
  inputsB,
}: {
  a: Pillars;
  b: Pillars;
  inputsA: Inputs;
  inputsB: Inputs;
}) {
  return (
    <div>
      <div className="text-[10px] tracking-[0.2em] text-muted uppercase text-center mb-3">
        네 기둥 비교
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Card label="A" inputs={inputsA} pillars={a} />
        <Card label="B" inputs={inputsB} pillars={b} />
      </div>
    </div>
  );
}
