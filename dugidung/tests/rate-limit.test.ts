import { describe, it, expect } from "vitest";
import { checkRateLimit } from "@/lib/rate-limit";
import { createMemoryStore } from "@/lib/kv";

describe("checkRateLimit", () => {
  it("allows up to the limit then blocks", async () => {
    const store = createMemoryStore();
    for (let i = 0; i < 10; i++) {
      expect(await checkRateLimit("1.2.3.4", store, 10, 60)).toBe(true);
    }
    expect(await checkRateLimit("1.2.3.4", store, 10, 60)).toBe(false);
  });

  it("tracks different IPs independently", async () => {
    const store = createMemoryStore();
    for (let i = 0; i < 10; i++) await checkRateLimit("a", store, 10, 60);
    expect(await checkRateLimit("a", store, 10, 60)).toBe(false);
    expect(await checkRateLimit("b", store, 10, 60)).toBe(true);
  });
});
