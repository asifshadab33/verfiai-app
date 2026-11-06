// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { lookupIsbn } from "./isbn";

describe("ISBN lookup hardening", () => {
  beforeEach(() => sessionStorage.clear());
  afterEach(() => vi.restoreAllMocks());

  it("reuses the cleaned ISBN cache without another request", async () => {
    const data = { "ISBN:9780140328721": { title: "Matilda" } };
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(Response.json(data));
    expect(await lookupIsbn("978-0-14-032872-1")).toEqual(data);
    expect(JSON.parse(sessionStorage.getItem("openlibrary:9780140328721") ?? "null").d).toEqual(data);
    expect(await lookupIsbn("9780140328721")).toEqual(data);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it.each([429, 500, 503])("does not cache a busy response (%s)", async (status) => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("", { status }));
    await expect(lookupIsbn("123")).rejects.toThrow(
      "OpenLibrary service is temporarily busy. Please try again shortly.",
    );
    expect(sessionStorage.getItem("openlibrary:123")).toBeNull();
  });

  it("continues when session storage is unavailable", async () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => { throw new Error("denied"); });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new Error("denied"); });
    vi.spyOn(globalThis, "fetch").mockResolvedValue(Response.json({ book: "available" }));
    expect(await lookupIsbn("123")).toEqual({ book: "available" });
  });
});