import { describe, it, expect } from "vitest";
import { sourceMeta, uniqueSources } from "./evidence";
import { getRoute, resolveModel } from "./model.server";
describe("source authority", () => {
  it("tiers domains", () => {
    expect(sourceMeta("https://www.cdc.gov/x").tier).toBe(1);
    expect(sourceMeta("https://www.reuters.com/x").tier).toBe(2);
    expect(sourceMeta("https://someone.medium.com/x").tier).toBe(3);
  });
  it("counts subdomains of one base domain once", () => {
    expect(sourceMeta("https://news.bbc.co.uk/a").originId).toBe(sourceMeta("https://www.bbc.co.uk/b").originId);
    expect(uniqueSources([{ url: "https://news.bbc.co.uk/a", title: "a", content: "x" }, { url: "https://sport.bbc.co.uk/b", title: "b", content: "y" }])).toHaveLength(1);
  });
});
describe("model cascade", () => {
  it("orders Groq, Gemini, GitHub first", () => {
    expect(getRoute("evaluation").slice(0, 3).map(m => resolveModel(m).provider)).toEqual(["deepinfra", "cerebras", "sambanova"]);
  });
});
