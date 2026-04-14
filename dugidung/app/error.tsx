"use client";
export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="relative min-h-screen flex items-center justify-center px-6">
      <div className="starfield" aria-hidden />
      <div className="relative text-center max-w-md">
        <div className="text-sm tracking-[0.35em] text-muted mb-10">兩</div>
        <h1 className="text-2xl text-accent mb-4">잠시 기둥이 흔들렸습니다</h1>
        <p className="text-muted mb-10">잠시 후 다시 시도해 주세요.</p>
        <button onClick={reset} className="text-ink border-b border-accent-dim pb-1 hover:border-accent">
          — 다시 시도 —
        </button>
      </div>
    </main>
  );
}
