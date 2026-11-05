import { describe, expect, it } from "vitest";
import { classifyStatus, isPublicAddress, parseSafeHttpsUrl } from "./link-check.server";

describe("source link checks", () => {
  it("treats 404, 410, 5xx and unreachable links as dead", () => {
    expect([404, 410, 500, 503, null].map(classifyStatus)).toEqual([
      "dead",
      "dead",
      "dead",
      "dead",
      "dead",
    ]);
  });

  it("keeps 200 and redirects", () => expect([200, 301].map(classifyStatus)).toEqual(["ok", "ok"]));

  it("keeps bot-blocked pages because the server is up", () =>
    expect([403, 429].map(classifyStatus)).toEqual(["blocked", "blocked"]));

  it("accepts only HTTPS URLs without embedded credentials", () => {
    expect(parseSafeHttpsUrl("https://example.com/report")).not.toBeNull();
    expect(parseSafeHttpsUrl("http://example.com")).toBeNull();
    expect(parseSafeHttpsUrl("https://user:pass@example.com")).toBeNull();
    expect(parseSafeHttpsUrl("javascript:alert(1)")).toBeNull();
  });

  it.each([
    "https://localhost/",
    "https://service.local/",
    "https://metadata.internal/",
    "https://127.0.0.1/",
    "https://10.0.0.8/",
    "https://172.16.0.1/",
    "https://192.168.1.1/",
    "https://169.254.169.254/",
    "https://[::1]/",
    "https://[::ffff:127.0.0.1]/",
  ])("rejects local and private destinations: %s", (url) => {
    expect(parseSafeHttpsUrl(url)).toBeNull();
  });

  it("rejects non-public IPv4 DNS answers", () => {
    for (const address of [
      "0.1.2.3",
      "10.0.0.1",
      "100.64.0.1",
      "127.0.0.1",
      "169.254.1.1",
      "172.31.255.254",
      "192.0.0.8",
      "192.0.2.1",
      "192.168.0.1",
      "198.18.0.1",
      "198.51.100.1",
      "203.0.113.1",
      "224.0.0.1",
      "255.255.255.255",
      "::1",
    ]) {
      expect(isPublicAddress(address), address).toBe(false);
    }
  });

  it("accepts representative globally routable IPv4 addresses", () => {
    expect(isPublicAddress("1.1.1.1")).toBe(true);
    expect(isPublicAddress("8.8.8.8")).toBe(true);
    expect(isPublicAddress("93.184.216.34")).toBe(true);
  });
});
