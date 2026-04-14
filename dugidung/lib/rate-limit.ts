import type { Store } from "@/lib/kv";

export async function checkRateLimit(
  ip: string,
  store: Store,
  limit: number,
  windowSeconds: number,
): Promise<boolean> {
  const n = await store.incr(`rl:${ip}`, windowSeconds);
  return n <= limit;
}
