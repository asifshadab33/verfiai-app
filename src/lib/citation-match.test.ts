import { describe, expect, it } from "vitest";
import { titleSimilarity, openAlexToWork } from "./citation.server";

describe("citation title matching", () => {
  it("matches a cited main title against a record with a subtitle", () => {
    expect(
      titleSimilarity("Deep learning", "Deep learning: a comprehensive review"),
    ).toBeGreaterThanOrEqual(0.93);
  });
  it("does not match unrelated titles", () => {
    expect(
      titleSimilarity("Quantum priming effects on consumer memory", "Deep learning"),
    ).toBeLessThan(0.85);
  });
  it("maps OpenAlex retraction flag so retracted papers are caught", () => {
    expect(
      openAlexToWork({ title: "X", is_retracted: true, doi: "https://doi.org/10.1/x" })?.[
        "updated-by"
      ],
    ).toEqual([{ type: "retraction" }]);
  });
});
