import { Redis } from "@upstash/redis";

export interface Store {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T): Promise<void>;
  incr(key: string, ttlSeconds: number): Promise<number>;
}

export function createMemoryStore(): Store {
  const data = new Map<string, unknown>();
  const counters = new Map<string, number>();
  return {
    async get<T>(key: string): Promise<T | null> {
      return (data.has(key) ? (data.get(key) as T) : null);
    },
    async set<T>(key: string, value: T): Promise<void> {
      data.set(key, value);
    },
    async incr(key: string, _ttlSeconds: number): Promise<number> {
      const next = (counters.get(key) ?? 0) + 1;
      counters.set(key, next);
      return next;
    },
  };
}

export function createUpstashStore(): Store {
  // Accept both modern Upstash env vars and legacy Vercel KV env vars.
  // Vercel's Marketplace now provisions Upstash-backed KV and may inject
  // either set depending on integration era.
  const url =
    process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
  const token =
    process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
  if (!url || !token) {
    throw new Error("Upstash/KV env vars missing (need URL + TOKEN)");
  }
  const redis = new Redis({ url, token });
  return {
    async get<T>(key: string): Promise<T | null> {
      const v = await redis.get<T>(key);
      return v ?? null;
    },
    async set<T>(key: string, value: T): Promise<void> {
      await redis.set(key, value);
    },
    async incr(key: string, ttlSeconds: number): Promise<number> {
      const n = await redis.incr(key);
      if (n === 1) await redis.expire(key, ttlSeconds);
      return n;
    },
  };
}

declare global {
  // eslint-disable-next-line no-var
  var __dugidungStore: Store | undefined;
}

function shouldUseRemote(): boolean {
  return (
    process.env.NODE_ENV !== "test" &&
    !!(process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL)
  );
}

export function defaultStore(): Store {
  if (globalThis.__dugidungStore) return globalThis.__dugidungStore;
  const store = shouldUseRemote() ? createUpstashStore() : createMemoryStore();
  globalThis.__dugidungStore = store;
  return store;
}
