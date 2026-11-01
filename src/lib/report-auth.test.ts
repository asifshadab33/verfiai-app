import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync(new URL("./report.functions.ts", import.meta.url), "utf8");

describe("report generation authentication", () => {
  it("exposes no guest report server function", () => {
    expect(source).not.toMatch(/generateGuestReport/);
  });

  it("requires authentication on the report generation endpoint", () => {
    const generate = source.slice(source.indexOf("export const generateReport"));
    expect(generate).toContain("requireSupabaseAuth");
  });

  it("has no createServerFn without the auth middleware", () => {
    const fns = source.split("export const ").slice(1);
    expect(fns.length).toBeGreaterThan(0);
    for (const fn of fns) expect(fn).toContain("requireSupabaseAuth");
  });
});
