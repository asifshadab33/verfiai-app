import { describe, expect, it } from "vitest";
import {
  acceptHeader,
  arrangeCitations,
  CITATION_STYLES,
  crossrefTransformUrl,
  styleById,
} from "./cite-format";

describe("citation formatting helpers", () => {
  it("offers the six common styles with CSL ids", () => {
    expect(CITATION_STYLES.map((s) => s.id)).toEqual([
      "apa",
      "mla",
      "chicago",
      "harvard",
      "ieee",
      "vancouver",
    ]);
    expect(styleById("mla")!.csl).toBe("modern-language-association");
    expect(styleById("nope")).toBeUndefined();
  });
  it("builds the content-negotiation request", () => {
    expect(acceptHeader("apa")).toBe("text/x-bibliography; style=apa; locale=en-US");
    expect(
      crossrefTransformUrl("10.1002/(sici)1097-4571(199806)49:8<693::aid-asi5>3.0.co;2-o"),
    ).toBe(
      "https://api.crossref.org/works/10.1002/(sici)1097-4571(199806)49%3A8%3C693%3A%3Aaid-asi5%3E3.0.co%3B2-o/transform",
    );
  });
  it("sorts author-date styles alphabetically", () => {
    expect(arrangeCitations("apa", ["Zed, A. (2020). Z.", "Adams, B. (2019). A.", "  "])).toEqual([
      "Adams, B. (2019). A.",
      "Zed, A. (2020). Z.",
    ]);
  });
  it("renumbers IEEE and Vancouver entries in order", () => {
    expect(
      arrangeCitations("ieee", ["[1] A. Author, “One,” 2020.", "[1]B. Writer, “Two,” 2021."]),
    ).toEqual(["[1] A. Author, “One,” 2020.", "[2] B. Writer, “Two,” 2021."]);
    expect(arrangeCitations("vancouver", ["1. Smith J. One. 2020.", "Lee K. Two. 2021."])).toEqual([
      "1. Smith J. One. 2020.",
      "2. Lee K. Two. 2021.",
    ]);
  });
});
