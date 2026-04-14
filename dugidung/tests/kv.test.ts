import { describe, it, expect, beforeEach } from "vitest";
import { createMemoryStore, type Store } from "@/lib/kv";

describe("MemoryStore", () => {
  let store: Store;
  beforeEach(() => { store = createMemoryStore(); });

  it("round-trips a value", async () => {
    await store.set("k", { a: 1 });
    expect(await store.get<{ a: number }>("k")).toEqual({ a: 1 });
  });

  it("returns null for missing key", async () => {
    expect(await store.get("missing")).toBeNull();
  });

  it("incr starts at 1 and increments", async () => {
    expect(await store.incr("count", 60)).toBe(1);
    expect(await store.incr("count", 60)).toBe(2);
  });
});
