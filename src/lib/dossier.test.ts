import { describe, expect, it } from "vitest";
import { dedupeSyndicated, DOSSIER_MAX_SOURCES } from "./dossier.server";

const text = "the central bank raised interest rates by half a percentage point on tuesday citing persistent inflation in services and housing";
describe("Deep Dossier dedup", () => {
  it("keeps only the higher-tier copy of syndicated content (>80% overlap)", () => {
    const out = dedupeSyndicated([
      { url: "https://example-blog.com/a", title: "Rates up", content: text },
      { url: "https://www.reuters.com/a", title: "Rates up", content: text },
    ]);
    expect(out.map(s => s.url)).toEqual(["https://www.reuters.com/a"]);
  });
  it("never returns more than 50 sources", () => {
    const many = Array.from({ length: 80 }, (_, i) => ({ url: `https://s${i}.org/p`, title: `t${i}`, content: `unique topic ${i} words alpha${i} beta${i} gamma${i}` }));
    expect(DOSSIER_MAX_SOURCES).toBe(50);
    expect(dedupeSyndicated(many).length).toBe(50);
  });
});
