"use client";
import { useEffect, useState } from "react";

export default function LoadingOverlay({ open }: { open: boolean }) {
  const [dots, setDots] = useState("");

  useEffect(() => {
    if (!open) {
      setDots("");
      return;
    }
    const id = setInterval(() => {
      setDots((d) => (d.length >= 3 ? "" : d + "·"));
    }, 400);
    return () => clearInterval(id);
  }, [open]);

  if (!open) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-50 bg-bg/85 backdrop-blur-sm flex flex-col items-center justify-center"
    >
      <div className="relative w-[120px] h-[80px] mb-5">
        <div className="absolute top-[10px] left-[15px] w-[60px] h-[60px] rounded-full border-2 border-accent animate-breathe" />
        <div className="absolute top-[10px] left-[45px] w-[60px] h-[60px] rounded-full border-2 border-accent animate-breathe opacity-70 [animation-delay:0.2s]" />
      </div>
      <div className="text-accent text-sm">
        기둥을 겹치는 중{dots}
      </div>
      <div className="text-muted text-[11px] tracking-[0.15em] mt-1">
        잠시만 기다려주세요
      </div>
    </div>
  );
}
