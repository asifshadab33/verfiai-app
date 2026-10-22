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
import { scoreSource, scoredSourceMeta, SOURCE_SCORE_WEIGHTS, hasSyndicationSignal, aggregateEvidence } from "./evidence";

describe("advanced metadata-grounded quality", () => {
  const now = new Date("2026-10-22T00:00:00Z");
  const claim = "Water temperatures increased worldwide";
  const source = { url: "https://www.cdc.gov/data.csv", title: claim, author: "Jane Smith", published: "2026-10-01" };
  it("recognizes a named author, while missing or anonymous metadata stays neutral", () => {
    expect(scoreSource(source, claim, [source], now).transparency).toBe("namedAuthor");
    const unknown = scoreSource({ url: source.url, title: claim, author: "Anonymous" }, claim, [], now);
    expect(unknown.transparency).toBe("unknown");
    expect(unknown.signals.transparency).toBe(0.5);
  });
  it("recognizes a named publisher or accountable organization without treating a hostname as a byline", () => {
    expect(scoreSource({ ...source, author: "", organization: "World Health Organization" }, claim).transparency).toBe("namedOrganization");
    expect(scoreSource({ ...source, author: "", publisher: "cdc.gov" }, claim).transparency).toBe("unknown");
  });
  it("requires claim overlap before calling original reporting direct", () => {
    expect(scoreSource({ ...source, sourceType: "original-reporting" }, claim).directness).toBe("primary");
    const unrelated = scoreSource({ ...source, title: "Football tournament results", sourceType: "original-reporting" }, claim);
    expect(unrelated.directness).toBe("unrelated");
    expect(unrelated.signals.directness).toBe(0);
  });
  it("distinguishes commentary, aggregation and ordinary topical reporting", () => {
    const prose = { url: "https://example.com/story", title: claim };
    expect(scoreSource({ ...prose, sourceType: "commentary" }, claim).directness).toBe("commentary");
    expect(scoreSource({ ...prose, sourceType: "review" }, claim).directness).toBe("aggregation");
    expect(scoreSource(prose, claim).directness).toBe("reporting");
  });
  it("reuses near-identical headlines across publishers as possible syndication", () => {
    const a = { url: "https://a.com/news", title: "Central bank raises interest rates to record high" };
    const b = { ...a, url: "https://b.com/news" };
    expect(hasSyndicationSignal(a, [a, b])).toBe(true);
    const rated = scoreSource(a, a.title, [a, b], now);
    expect(rated.directness).toBe("syndicated");
    expect(rated.signals.independence).toBe(0.4);
  });
  it("recognizes observed dataset links and methodology but not mere mentions of statistics", () => {
    expect(scoreSource(source, claim).originalData).toBe("dataLinked");
    expect(scoreSource({ url: "https://example.org/study", content: "Methods: we measured water temperatures", title: claim }, claim).originalData).toBe("methodsVisible");
    expect(scoreSource({ url: "https://example.org/news", content: "A study mentions official statistics", title: claim }, claim).originalData).toBe("unknown");
  });
  it("uses exact documented weights and a bounded 100-point score", () => {
    expect(SOURCE_SCORE_WEIGHTS).toEqual({ authority: 25, recency: 10, independence: 15, transparency: 15, directness: 25, originalData: 10 });
    expect(scoreSource(source, claim, [source], now).score).toBe(100);
    const rated = scoreSource({ url: "https://example.com/news", title: claim }, claim, [], now);
    // .35*25 + .5*10 + 1*15 + .5*15 + .65*25 + .25*10 = 55.
    expect(rated.score).toBe(55);
    expect(rated.label).toBe("Moderate");
    expect(scoreSource(source, claim, [source], now).label).toBe("Strong");
    expect(scoreSource({ url: "https://example.com/news", title: "Unrelated football tournament", syndicated: true }, claim, [], now).label).toBe("Weak");
  });
  it("does not claim recency for future or missing publication dates", () => {
    expect(scoreSource({ ...source, published: "2027-01-01" }, claim, [], now).signals.recency).toBe(0.5);
    expect(scoreSource({ ...source, published: "" }, claim, [], now).signals.recency).toBe(0.5);
  });
  it("preserves exact legacy weights and verdicts when disabled", () => {
    const judgments = [{ excerptId: "1", stance: "supports" as const, quote: "Water temperatures increased worldwide" }];
    const news = { url: "https://reuters.com/story", title: "Unrelated football tournament" };
    const legacy = sourceMeta(news.url);
    expect(scoredSourceMeta(news, claim, [news], false)).toEqual(legacy);
    expect(aggregateEvidence(judgments, new Map([["1", scoredSourceMeta(news, claim, [news], false)]]))).toBe("SUPPORTED");
    expect(aggregateEvidence(judgments, new Map([["1", scoredSourceMeta(news, claim, [news], true)]]))).toBe("UNVERIFIABLE");
  });
});
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
