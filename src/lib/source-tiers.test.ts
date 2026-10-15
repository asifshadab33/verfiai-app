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
  it("puts fast free providers first, then OpenRouter free models", () => {
    const r = getRoute("evaluation");
    expect(r.slice(0, 3).map(m => resolveModel(m).provider)).toEqual(["cerebras", "groq", "sambanova"]);
    expect(r.slice(3, 5)).toEqual(["meta-llama/llama-3.3-70b-instruct:free", "qwen/qwen-2.5-72b-instruct:free"]);
  });
});

import { qualitativeStrength, sourceQuality } from "./evidence";
describe("user-facing evidence labels", () => {
  it("maps strength to Strong/Moderate/Weak", () => {
    expect(qualitativeStrength("Strong evidence")).toBe("Strong");
    expect(qualitativeStrength("Moderate evidence")).toBe("Moderate");
    expect(qualitativeStrength("Limited evidence")).toBe("Weak");
    expect(qualitativeStrength("Insufficient evidence")).toBe("Weak");
  });
  it("labels source quality by domain", () => {
    expect(sourceQuality("https://www.nature.com/a")).toBe("Peer-reviewed source");
    expect(sourceQuality("https://www.cdc.gov/x")).toBe("Government or intergovernmental source");
    expect(sourceQuality("https://www.reuters.com/x")).toBe("Reputable news source");
    expect(sourceQuality("https://foo.substack.com/p")).toBe("Low-authority or unverified source");
  });
});
