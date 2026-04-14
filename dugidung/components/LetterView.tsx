import type { Letter } from "@/lib/types";

export default function LetterView({ letter }: { letter: Letter }) {
  const paragraphs = letter.body.split(/\n\n+/);
  return (
    <article className="text-[17px] text-ink">
      {paragraphs.map((p, i) => (
        <p key={i} className="mb-[22px] last:mb-0 whitespace-pre-line">
          {p}
        </p>
      ))}
    </article>
  );
}
