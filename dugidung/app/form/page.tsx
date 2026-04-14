import CoupleForm from "@/components/CoupleForm";

export default function FormPage() {
  return (
    <main className="relative min-h-screen flex items-center justify-center px-6 py-16">
      <div className="starfield" aria-hidden />
      <div className="relative w-full flex flex-col items-center">
        <div className="text-sm tracking-[0.35em] text-muted mb-10">兩 · 두 기 둥</div>
        <CoupleForm />
      </div>
    </main>
  );
}
