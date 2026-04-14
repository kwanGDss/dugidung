"use client";
import { useState } from "react";

export default function ShareBar({ url, text }: { url: string; text: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch { /* clipboard not available */ }
  }

  const x = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;

  return (
    <div className="flex justify-center gap-6 mt-8 text-sm">
      <button type="button" onClick={copy} className="text-accent border-b border-accent-dim hover:border-accent pb-0.5">
        {copied ? "복사됨" : "링크 복사"}
      </button>
      <a href={x} target="_blank" rel="noopener noreferrer" className="text-accent border-b border-accent-dim hover:border-accent pb-0.5">
        X
      </a>
    </div>
  );
}
