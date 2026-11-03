import { describe, it, expect } from "vitest";
import { parseEmailHeaders } from "./email-headers";
describe("parseEmailHeaders", () => {
  it("parses SPF", () => {
    const r = parseEmailHeaders("Authentication-Results: spf=pass");
    expect(r.spf).toBe("pass");
  });
});
