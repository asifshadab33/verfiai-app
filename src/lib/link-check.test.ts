import { describe, expect, it } from "vitest";
import { classifyStatus } from "./link-check.server";

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
});
