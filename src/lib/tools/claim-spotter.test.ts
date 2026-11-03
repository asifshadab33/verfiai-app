import { describe, expect, it } from "vitest";
import { spotClaims, spotWording } from "./claim-spotter";

describe("claim spotter", () => {
  it("finds checkable sentences and skips opinions, questions and fragments", () => {
    const text =
      "The company reported revenue of $4.2 billion in 2023, up 12% from the year before. I think the product is lovely. Is this true? Experts say it is the best phone ever made. It rained.";
    const claims = spotClaims(text);
    expect(claims).toHaveLength(2);
    expect(claims[0]!.signals).toContain("number");
    expect(claims[0]!.signals).toContain("date");
    for (const c of claims) expect(text.slice(c.start, c.end)).toBe(c.text);
  });
  it("rates sentences with many signals as strong", () => {
    const c = spotClaims(
      "According to the WHO, 3.5 million people died in 2019 because of air pollution.",
    );
    expect(c).toHaveLength(1);
    expect(c[0]!.strength).toBe("strong");
  });
  it("ignores sentences that only name things", () => {
    expect(spotClaims("We visited Paris and London last summer with friends.")).toHaveLength(0);
  });
});

describe("wording spotter", () => {
  it("categorises vague attribution, absolutes and hedges", () => {
    const text = "Studies show coffee is always good. Experts say it might help, reportedly.";
    const m = spotWording(text);
    const by = (cat: string) =>
      m.filter((x) => x.category === cat).map((x) => x.text.toLowerCase());
    expect(by("vague-attribution")).toEqual(["studies show", "experts say", "reportedly"]);
    expect(by("absolute-or-hype")).toEqual(["always"]);
    expect(by("hedge")).toEqual(["might"]);
    for (const x of m) expect(text.slice(x.start, x.end)).toBe(x.text);
  });
  it("never returns overlapping matches", () => {
    const m = spotWording(
      "Everyone knows that experts say it is obviously, clearly, completely true. Some say it could be the best ever.",
    );
    for (let i = 1; i < m.length; i++) expect(m[i]!.start >= m[i - 1]!.end).toBe(true);
    expect(m.length).toBeGreaterThan(4);
  });
  it("finds nothing in neutral text", () => {
    expect(spotWording("The committee met on Tuesday and approved the budget.")).toHaveLength(0);
  });
});
