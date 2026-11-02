import { describe, expect, it } from "vitest";
import { collectNotices, integrityOf } from "./doi-notices";

const DOI = "10.1000/paper";
const retraction = { DOI: "10.1000/notice", type: "retraction", label: "Retraction", source: "retraction-watch", updated: { "date-parts": [[2020, 3, 5]] } };

describe("retraction and correction notices", () => {
  it("reads notices from the work's updated-by list", () => {
    const n = collectNotices(DOI, { "updated-by": [retraction] }, []);
    expect(n).toEqual([{ type: "retraction", label: "Retraction", date: "2020-03-05", noticeDoi: "10.1000/notice" }]);
    expect(integrityOf("A paper", n)).toBe("retracted");
  });
  it("de-duplicates the same notice found through the updates query", () => {
    const items = [{ DOI: "10.1000/notice", "update-to": [{ DOI, type: "retraction", label: "Retraction", updated: { "date-parts": [[2020, 3, 5]] } }] }];
    expect(collectNotices(DOI, { "updated-by": [retraction] }, items)).toHaveLength(1);
  });
  it("ignores notices that point at other papers", () => {
    const items = [{ DOI: "10.1000/other-notice", "update-to": [{ DOI: "10.1000/different", type: "retraction" }] }];
    expect(collectNotices(DOI, {}, items)).toEqual([]);
  });
  it("ranks retraction above concern above correction", () => {
    expect(integrityOf("x", [{ type: "correction" }, { type: "expression_of_concern" }])).toBe("expression_of_concern");
    expect(integrityOf("x", [{ type: "erratum" }])).toBe("corrected");
    expect(integrityOf("x", [{ type: "partial_retraction" }])).toBe("partial_retraction");
    expect(integrityOf("x", [{ type: "correction" }, { type: "withdrawal" }])).toBe("retracted");
    expect(integrityOf("x", [])).toBe("none");
  });
  it("treats a RETRACTED title as retracted and formats partial dates", () => {
    expect(integrityOf("RETRACTED: Something", [])).toBe("retracted");
    expect(collectNotices(DOI, { "updated-by": [{ DOI: "10.1000/n2", type: "Expression of Concern", updated: { "date-parts": [[2021, 7]] } }] }, [])[0]).toEqual({ type: "expression_of_concern", label: undefined, date: "2021-07", noticeDoi: "10.1000/n2" });
  });
});
