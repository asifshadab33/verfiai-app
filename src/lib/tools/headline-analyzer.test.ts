import { describe, expect, it } from "vitest";
import { analyzeHeadline } from "./headline-analyzer";

const status = (r: ReturnType<typeof analyzeHeadline>, id: string) => r.checks.find(c => c.id === id)?.status;

describe("headline analyzer", () => {
  it("flags clickbait, vague attribution and shouty punctuation", () => {
    const r = analyzeHeadline("You Won't Believe What Doctors Say About Coffee — It's Shocking!!");
    expect(status(r, "clickbait")).toBe("warn");
    expect(status(r, "attribution")).toBe("warn");
    expect(status(r, "punctuation")).toBe("warn");
    expect(r.warnings).toBeGreaterThan(2);
  });
  it("is satisfied by a specific, sourced-sounding headline", () => {
    const r = analyzeHeadline("Study finds coffee linked to 12% lower risk of liver disease");
    expect(r.warnings).toBe(0);
    expect(status(r, "number")).toBe("good");
    expect(status(r, "length")).toBe("good");
  });
  it("flags absolute claims", () => {
    const r = analyzeHeadline("Vitamin D always cures colds, scientists say");
    expect(status(r, "absolute")).toBe("warn");
    expect(status(r, "attribution")).toBe("warn");
  });
  it("notes question and list headlines without penalising them", () => {
    expect(status(analyzeHeadline("Is coffee good for your heart?"), "question")).toBe("note");
    expect(status(analyzeHeadline("10 ways to read a clinical trial"), "list")).toBe("note");
  });
  it("flags mostly capital letters and over-long headlines", () => {
    expect(status(analyzeHeadline("BREAKING NEWS ABOUT EVERYTHING YOU LOVE"), "caps")).toBe("warn");
    expect(status(analyzeHeadline("A very long headline that keeps going well past the point where a search engine would show it in full"), "length")).toBe("warn");
  });
  it("returns an empty report for blank input", () => {
    const r = analyzeHeadline("   ");
    expect(r.checks).toHaveLength(0);
    expect(r.characters).toBe(0);
  });
});
