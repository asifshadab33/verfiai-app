import { describe, it, expect } from "vitest";
import { uniqueSources } from "./evidence";
import { counterQuery } from "./search.server";
describe("search pipeline", () => {
  it("drops syndicated wire headlines on different hosts", () => {
    const r = uniqueSources([
      { url: "https://a.com/x", title: "Central bank raises interest rates to record high - AP", content: "a" },
      { url: "https://b.com/y", title: "Central bank raises interest rates to record high", content: "b" },
    ]);
    expect(r).toHaveLength(1);
  });
  it("builds a counter-angle debunk query", () => {
    expect(counterQuery("vaccines cause autism")).toContain("debunked");
  });
});
