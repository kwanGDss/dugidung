import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main className="relative min-h-screen flex items-center justify-center px-6">
      <Image
        src="/bg-landing.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover opacity-35"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-bg/60 via-bg/45 to-bg" />
      <div className="starfield" aria-hidden />
      <div className="relative text-center max-w-md">
        <div className="text-sm tracking-[0.35em] text-muted mb-10">兩 · 두 기 둥</div>
        <h1 className="text-4xl md:text-5xl text-accent mb-6">두 기둥을 겹쳐봅니다</h1>
        <p className="text-muted mb-12">두 사람의 사주와 기질이 만나는 자리</p>
        <Link
          href="/form"
          className="inline-block text-ink border-b border-accent-dim pb-1 hover:border-accent"
        >
          — 시작하기 —
        </Link>
        <footer className="mt-24 text-xs text-muted tracking-wider">
          <a href="https://sajuboja.vercel.app" className="hover:text-ink">사주보자</a>
          <span className="mx-3">·</span>
          <a href="https://github.com/kwanGDss" className="hover:text-ink">GitHub</a>
        </footer>
      </div>
    </main>
  );
}
