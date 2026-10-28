import { describe, expect, it } from "vitest";
import { documentLanguage, sharedReportDescription } from "./page-language";
import { readFileSync } from "node:fs";

describe("page language and private report metadata", () => {
  it("keeps English-only pages English despite an Arabic or Hindi query", () => {
    for (const page of ["/methodology", "/privacy", "/sources", "/knowledge", "/resources", "/r/example", "/fact-check/humans-use-10-percent-of-brain", "/fact-checker"]) {
      expect(documentLanguage(page, "ar")).toBe("en");
      expect(documentLanguage(page, "hi")).toBe("en");
    }
  });
  it("retains the active language on translated workspaces", () => {
    expect(documentLanguage("/", "ar")).toBe("ar");
    expect(documentLanguage("/app/", "hi")).toBe("hi");
    expect(documentLanguage("/", "invalid")).toBe("en");
  });
  it("provides a nonempty description for absent or blank summaries", () => {
    for (const summary of [undefined, null, "", " \n\t "]) {
      expect(sharedReportDescription(summary)).toBe("Read a shared, read-only Verfiai research report with source links and evidence limitations. Access is controlled by the report owner.");
    }
    expect(sharedReportDescription(" A\n report. ")).toBe("A report.");
  });
  it("keeps shared report URLs out of the sitemap", () => {
    const sitemap = readFileSync(new URL("../../public/sitemap.xml", import.meta.url), "utf8");
    expect(sitemap).not.toMatch(/<loc>[^<]*\/r\//);
  });
});