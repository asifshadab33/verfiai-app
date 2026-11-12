import { describe, expect, it, vi } from "vitest";
vi.mock("./db.server", () => ({ admin: async () => ({}) }));
import { researchResultKey } from "./research-cache.server";

describe("research cache key normalization", () => {
  it("reuses keys across case, spacing and field order", () => {
    const a = researchResultKey("u1", { question: "  What is  CRISPR? ", focus: "" }, "legacy");
    const b = researchResultKey("u1", { focus: "", question: "what is crispr?" }, "legacy");
    expect(a).toBe(b);
  });
  it("keeps numbers and punctuation distinct", () => {
    expect(researchResultKey("u1", { question: "rate 1.5%" }, "legacy")).not.toBe(
      researchResultKey("u1", { question: "rate 15%" }, "legacy"),
    );
  });
  it("keeps callers and cohorts separate", () => {
    const q = { question: "x" };
    expect(researchResultKey("u1", q, "legacy")).not.toBe(researchResultKey("u2", q, "legacy"));
    expect(researchResultKey("u1", q, "legacy")).not.toBe(researchResultKey("u1", q, "scoring-v1"));
  });
  it("ignores leading request phrases but keeps negations distinct", () => {
    const base = researchResultKey("u1", { question: "coffee raises blood pressure" }, "legacy");
    expect(researchResultKey("u1", { question: "Is it true that coffee raises blood pressure" }, "legacy")).toBe(base);
    expect(researchResultKey("u1", { question: "Can you please check if coffee raises blood pressure" }, "legacy")).toBe(base);
    expect(researchResultKey("u1", { question: "coffee does not raise blood pressure" }, "legacy")).not.toBe(base);
  });
});
