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
  it("runs Lovable AI first, then the existing fast free providers and OpenRouter free models", () => {
    for (const name of ["triage", "evaluation"] as const) {
      expect(getRoute(name).slice(0, 2).map(m => resolveModel(m).provider)).toEqual(["lovable", "lovable"]);
    }
    const r = getRoute("evaluation").slice(2);
    expect(r.slice(0, 3).map(m => resolveModel(m).provider)).toEqual(["cerebras", "groq", "sambanova"]);
    expect(r.slice(3, 5)).toEqual(["google/gemma-4-26b-a4b-it:free", "nvidia/nemotron-3-super-120b-a12b:free"]);
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
