// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { lookupIsbn } from "./isbn";
import { SESSION_CACHE_MAX_CHARS, SESSION_CACHE_TTL_MS, readSessionCache, writeSessionCache } from "./session-cache";

describe("bounded session cache", () => {
  beforeEach(() => sessionStorage.clear());
  afterEach(() => { vi.useRealTimers(); vi.restoreAllMocks(); });

  it("expires entries after one hour and removes them", () => {
    vi.useFakeTimers();
    vi.setSystemTime(0);
    writeSessionCache("dns:A:x.com", { ok: 1 });
    vi.setSystemTime(SESSION_CACHE_TTL_MS - 1);
    expect(readSessionCache("dns:A:x.com")).toEqual({ ok: 1 });
    vi.setSystemTime(SESSION_CACHE_TTL_MS + 1);
    expect(readSessionCache("dns:A:x.com")).toBeUndefined();
    expect(sessionStorage.getItem("dns:A:x.com")).toBeNull();
  });

  it("refuses to store oversized values", () => {
    expect(writeSessionCache("arxiv:big", "x".repeat(SESSION_CACHE_MAX_CHARS))).toBe(false);
    expect(sessionStorage.getItem("arxiv:big")).toBeNull();
  });

  it("drops oversized and legacy unversioned entries on read", () => {
    sessionStorage.setItem("arxiv:big", "x".repeat(SESSION_CACHE_MAX_CHARS + 1));
    sessionStorage.setItem("arxiv:old", JSON.stringify([{ title: "old" }]));
    expect(readSessionCache("arxiv:big")).toBeUndefined();
    expect(readSessionCache("arxiv:old")).toBeUndefined();
    expect(sessionStorage.length).toBe(0);
  });

  it("refetches an ISBN when the cached entry is stale", async () => {
    sessionStorage.setItem("openlibrary:123", JSON.stringify({ v: 1, t: Date.now() - SESSION_CACHE_TTL_MS - 1, d: { stale: true } }));
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(Response.json({ fresh: true }));
    expect(await lookupIsbn("123")).toEqual({ fresh: true });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
