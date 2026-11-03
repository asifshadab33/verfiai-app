import { describe, expect, it } from "vitest";
import { normalizeImageUrl, reverseSearchLinks, UPLOAD_SEARCH_PAGES } from "./image-search";

describe("reverse image search links", () => {
  it("accepts public image addresses and adds https when missing", () => {
    expect(normalizeImageUrl("example.com/cat.jpg")).toEqual({
      ok: true,
      url: "https://example.com/cat.jpg",
    });
    expect(normalizeImageUrl(" https://example.com/a.png?x=1 ")).toEqual({
      ok: true,
      url: "https://example.com/a.png?x=1",
    });
  });
  it("rejects addresses search engines cannot reach or that are unsafe", () => {
    for (const bad of [
      "",
      "not a url",
      "ftp://example.com/a.jpg",
      "http://localhost/a.png",
      "https://192.168.1.5/a.jpg",
      "https://10.0.0.2/a.jpg",
      "https://intranet/a.jpg",
      "https://user:pw@example.com/a.jpg",
      "javascript:alert(1)",
    ])
      expect(normalizeImageUrl(bad).ok).toBe(false);
  });
  it("builds one link per engine with the address encoded", () => {
    const links = reverseSearchLinks("https://example.com/a b.jpg");
    expect(links.map((l) => l.id)).toEqual(["google", "bing", "yandex", "tineye"]);
    expect(links[0]!.url).toBe(
      "https://lens.google.com/uploadbyurl?url=https%3A%2F%2Fexample.com%2Fa%20b.jpg",
    );
    for (const l of links) expect(l.url.startsWith("https://")).toBe(true);
    expect(UPLOAD_SEARCH_PAGES).toHaveLength(4);
  });
});
