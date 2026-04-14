export default function ScoreRing({ score }: { score: number }) {
  const pct = Math.max(0, Math.min(100, score));
  return (
    <div
      role="img"
      aria-label={`궁합 점수 ${pct}점`}
      className="relative w-[200px] h-[200px] rounded-full flex items-center justify-center"
      style={{
        background: `conic-gradient(#D4B678 0% ${pct}%, #232A42 ${pct}% 100%)`,
        boxShadow: "0 0 60px rgba(212,182,120,0.12)",
      }}
    >
      <div className="absolute inset-4 rounded-full bg-bg" />
      <span className="relative text-6xl text-ink leading-none">{pct}</span>
    </div>
  );
}
