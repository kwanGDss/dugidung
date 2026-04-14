import { kv as vercelKv } from "@vercel/kv";

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

export function createVercelStore(): Store {
  return {
    async get<T>(key: string): Promise<T | null> {
      const v = await vercelKv.get<T>(key);
      return v ?? null;
    },
    async set<T>(key: string, value: T): Promise<void> {
      await vercelKv.set(key, value);
    },
    async incr(key: string, ttlSeconds: number): Promise<number> {
      const n = await vercelKv.incr(key);
      if (n === 1) await vercelKv.expire(key, ttlSeconds);
      return n;
    },
  };
}

declare global {
  // eslint-disable-next-line no-var
  var __dugidungStore: Store | undefined;
}

export function defaultStore(): Store {
  if (globalThis.__dugidungStore) return globalThis.__dugidungStore;
  const store =
    process.env.NODE_ENV === "test" || !process.env.KV_REST_API_URL
      ? createMemoryStore()
      : createVercelStore();
  globalThis.__dugidungStore = store;
  return store;
}
