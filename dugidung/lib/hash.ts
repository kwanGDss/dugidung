import { createHash } from "node:crypto";
import type { Inputs } from "@/lib/types";

const ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

function toBase62(bytes: Buffer): string {
  let n = 0n;
  for (const b of bytes) n = (n << 8n) | BigInt(b);
  let out = "";
  const base = 62n;
  while (n > 0n) {
    out = ALPHABET[Number(n % base)] + out;
    n = n / base;
  }
  return out || "0";
}

function key(i: Inputs): string {
  return `${i.birth}|${i.mbti.toUpperCase()}`;
}

export function normalizePair<T extends Inputs>(a: T, b: T): [T, T] {
  return key(a) <= key(b) ? [a, b] : [b, a];
}

export function hashInputs(a: Inputs, b: Inputs): string {
  const [x, y] = normalizePair(
    { birth: a.birth, mbti: a.mbti.toUpperCase() },
    { birth: b.birth, mbti: b.mbti.toUpperCase() },
  );
  const canonical = JSON.stringify([key(x), key(y)]);
  const digest = createHash("sha256").update(canonical).digest();
  const prefix = digest.subarray(0, 6); // 48 bits
  const s = toBase62(prefix);
  return s.padStart(8, "0").slice(-8);
}
