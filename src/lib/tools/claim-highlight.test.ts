import { describe, expect, it } from "vitest";
import { annotateText, evidenceCoverage, locateSentences } from "./claim-highlight";

const TEXT = "The Great Wall of China is visible from the Moon with the naked eye. Water boils at 100 degrees Celsius at sea level. Humans only use 10 percent of their brains.";

describe("claim highlighting", () => {
  it("returns sentence offsets that slice back to the sentence", () => {
    for (const s of locateSentences(TEXT)) expect(TEXT.slice(s.start, s.end)).toBe(s.text);
    expect(locateSentences(TEXT)).toHaveLength(3);
  });
  it("attaches each claim to the sentence it came from, even when paraphrased", () => {
    const r = annotateText(TEXT, [
      { claim: "The Great Wall of China is visible from the Moon", verdict: "CONTRADICTED" },
      { claim: "Water boils at 100 degrees Celsius at sea level", verdict: "SUPPORTED" },
      { claim: "Humans use only ten percent of their brains", verdict: "CONTRADICTED" },
    ]);
    expect(r.sentences.map(s => s.verdict)).toEqual(["CONTRADICTED", "SUPPORTED", "CONTRADICTED"]);
    expect(r.sentences.map(s => s.claims)).toEqual([[0], [1], [2]]);
    expect(r.unmatched).toEqual([]);
  });
  it("lists claims that cannot be located", () => {
    const r = annotateText(TEXT, [{ claim: "Mount Everest is the highest mountain above sea level", verdict: "SUPPORTED" }]);
    expect(r.unmatched).toEqual([0]);
    expect(r.sentences.every(s => s.verdict === null)).toBe(true);
  });
  it("lets the strictest verdict win when two claims share a sentence", () => {
    const r = annotateText("Paris is the capital of France and has 40 million residents.", [
      { claim: "Paris is the capital of France", verdict: "SUPPORTED" },
      { claim: "Paris has 40 million residents", verdict: "CONTRADICTED" },
    ]);
    expect(r.sentences[0]!.verdict).toBe("CONTRADICTED");
    expect(r.sentences[0]!.claims).toEqual([0, 1]);
  });
  it("works for text without spaces between words", () => {
    const r = annotateText("长城可以从月球上用肉眼看到。水在海平面一百摄氏度沸腾。", [{ claim: "长城可以从月球上用肉眼看到", verdict: "CONTRADICTED" }]);
    expect(r.sentences[0]!.verdict).toBe("CONTRADICTED");
  });
  it("summarises evidence coverage as counts", () => {
    const c = evidenceCoverage([{ claim: "a", verdict: "SUPPORTED" }, { claim: "b", verdict: "SUPPORTED" }, { claim: "c", verdict: "MIXED" }, { claim: "d", verdict: "UNVERIFIABLE" }]);
    expect(c).toEqual({ total: 4, supported: 2, contradicted: 0, mixed: 1, insufficient: 1, needsReview: 2, supportedPct: 50 });
    expect(evidenceCoverage([]).supportedPct).toBe(0);
  });
});
