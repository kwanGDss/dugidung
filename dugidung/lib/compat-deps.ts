import { defaultStore, type Store } from "@/lib/kv";
import type { Caller } from "@/lib/llm";

type Deps = { store: Store; call?: Caller["call"] };

let DEPS: Deps = { store: defaultStore() };

export function getStore(): Store {
  return DEPS.store;
}

export function getCall(): Caller["call"] | undefined {
  return DEPS.call;
}

export function __setDeps(d: Partial<Deps>) {
  if (process.env.NODE_ENV !== "test") {
    throw new Error("__setDeps is test-only");
  }
  DEPS = { ...DEPS, ...d };
}
