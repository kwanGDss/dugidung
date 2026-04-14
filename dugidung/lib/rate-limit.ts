import type { Store } from "@/lib/kv";

export async function checkRateLimit(
  key: string,
  store: Store,
  limit: number,
  windowSeconds: number,
): Promise<boolean> {
  const n = await store.incr(`rl:${key}`, windowSeconds);
  return n <= limit;
}
