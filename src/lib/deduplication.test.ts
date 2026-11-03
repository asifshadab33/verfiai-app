import { describe, expect, it } from "vitest";
import { dedupeDocuments, DOCUMENT_CAP } from "./deduplication.server";

const abs =
  "we measured microplastic particles in tap water samples from twelve cities and found median concentrations varied tenfold";
describe("document dedup", () => {
  it("keeps the open-access paper over an overlapping Scribd upload", () => {
    const out = dedupeDocuments([
      {
        kind: "scribd",
        title: "Microplastics",
        url: "https://www.scribd.com/document/1/x",
        content: abs,
        score: 0,
      },
      {
        kind: "openalex_oa",
        title: "Microplastics",
        url: "https://journal.org/paper.pdf",
        content: abs,
        score: 0,
      },
    ]);
    expect(out.map((d) => d.kind)).toEqual(["openalex_oa"]);
  });
  it("caps document summaries at 20", () => {
    const many = Array.from({ length: 40 }, (_, i) => ({
      kind: "core" as const,
      title: `p${i}`,
      url: `https://r.org/${i}`,
      content: `alpha${i} beta${i} gamma${i} delta${i}`,
      score: 0,
    }));
    expect(DOCUMENT_CAP).toBe(20);
    expect(dedupeDocuments(many).length).toBe(20);
  });
});
