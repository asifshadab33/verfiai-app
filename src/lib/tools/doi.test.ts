import { describe, expect, it } from "vitest";
import { extractDois, normalizeDoi } from "./doi";

describe("DOI parsing", () => {
  it("normalises URLs, prefixes and trailing punctuation", () => {
    expect(normalizeDoi("https://doi.org/10.1038/nature14539")).toBe("10.1038/nature14539");
    expect(normalizeDoi("doi:10.1016/S0140-6736(97)11096-0.")).toBe("10.1016/S0140-6736(97)11096-0");
    expect(normalizeDoi("(doi:10.1038/nature14539)")).toBe("10.1038/nature14539");
    expect(normalizeDoi("https://doi.org/10.1038%2Fnature14539,")).toBe("10.1038/nature14539");
  });
  it("rejects things that are not DOIs", () => {
    expect(normalizeDoi("hello")).toBeNull();
    expect(normalizeDoi("10.12/short")).toBeNull();
    expect(normalizeDoi("")).toBeNull();
  });
  it("finds de-duplicated DOIs inside reference lists", () => {
    const text = `1. LeCun Y, et al. Deep learning. Nature. 2015. doi:10.1038/nature14539
2. Wakefield AJ. Lancet. 1998. https://doi.org/10.1016/S0140-6736(97)11096-0
3. Again: DOI 10.1038/NATURE14539.
4. Smith J. Quantum priming. 2019.`;
    expect(extractDois(text)).toEqual({ dois: ["10.1038/nature14539", "10.1016/S0140-6736(97)11096-0"], total: 2 });
  });
  it("caps the list but reports the true total", () => {
    const text = Array.from({ length: 15 }, (_, i) => `10.1000/item${i}`).join(" ");
    const r = extractDois(text, 10);
    expect(r.dois).toHaveLength(10);
    expect(r.total).toBe(15);
  });
});
