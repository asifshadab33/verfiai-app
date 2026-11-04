import { describe, it, expect } from "vitest";
import { inspectUrl } from "./url-inspector";

describe("inspectUrl", () => {
  it("extracts domain and protocol correctly", () => {
    const result = inspectUrl("https://example.com/path");
    expect(result).not.toBeNull();
    expect(result?.domain).toBe("example.com");
    expect(result?.protocol).toBe("https:");
  });

  it("detects common tracking parameters", () => {
    const result = inspectUrl("https://example.com?utm_source=google&fbclid=123");
    expect(result?.trackingParams).toContain("utm_source");
    expect(result?.trackingParams).toContain("fbclid");
  });

  it("detects Punycode/IDN domains", () => {
    const result = inspectUrl("https://xn--bcher-kva.de");
    expect(result).not.toBeNull();
    expect(result?.domain).toBe("xn--bcher-kva.de");
    expect(result?.punycode).toBe("Yes (IDN detected)");
  });

  it("returns null for invalid URLs", () => {
    expect(inspectUrl("not-a-url")).toBeNull();
  });
});
