import Link from "next/link";

export default function NotFound() {
  return (
    <main className="relative min-h-screen flex items-center justify-center px-6">
      <div className="starfield" aria-hidden />
      <div className="relative text-center max-w-md">
        <div className="text-sm tracking-[0.35em] text-muted mb-10">兩</div>
        <h1 className="text-2xl text-accent mb-4">기둥을 찾지 못했습니다</h1>
        <p className="text-muted mb-10">이 자리에는 아직 아무 이야기도 쓰이지 않았습니다.</p>
        <Link href="/form" className="text-ink border-b border-accent-dim pb-1 hover:border-accent">
          — 우리 기둥 세우기 —
        </Link>
      </div>
    </main>
  );
}
