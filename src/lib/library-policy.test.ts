import { describe, expect, it } from "vitest";
import { libraryIssueInput, librarySearchInput, safePublisherUrl } from "./library-policy";

describe("library input and link safeguards", () => {
  const issue = {
    id: "00000000-0000-4000-8000-000000000001",
    type: "OTHER",
    message: "A source link is broken.",
  };
  it("rejects malformed issue identifiers and categories", () => {
    expect(libraryIssueInput.safeParse({ ...issue, id: "' OR 1=1" }).success).toBe(false);
    expect(libraryIssueInput.safeParse({ ...issue, type: "ADMIN" }).success).toBe(false);
  });
  it("bounds trimmed issue messages to 10–2000 characters", () => {
    expect(libraryIssueInput.safeParse({ ...issue, message: " ".repeat(10) }).success).toBe(false);
    expect(libraryIssueInput.safeParse({ ...issue, message: "x".repeat(9) }).success).toBe(false);
    expect(libraryIssueInput.safeParse({ ...issue, message: "x".repeat(10) }).success).toBe(true);
    expect(libraryIssueInput.safeParse({ ...issue, message: "x".repeat(2000) }).success).toBe(true);
    expect(libraryIssueInput.safeParse({ ...issue, message: "x".repeat(2001) }).success).toBe(
      false,
    );
  });
  it("rejects overlong queries and invalid catalog kinds", () => {
    expect(librarySearchInput.safeParse({ kind: "index", query: "x".repeat(161) }).success).toBe(
      false,
    );
    expect(librarySearchInput.safeParse({ kind: "private" }).success).toBe(false);
    expect(librarySearchInput.parse({ kind: "library" }).query).toBe("");
  });
  it("permits original HTTP(S) URLs but not script or credential URLs", () => {
    expect(safePublisherUrl("https://doi.org/10.1038/nature14539")).toBe(
      "https://doi.org/10.1038/nature14539",
    );
    expect(safePublisherUrl("javascript:alert(1)")).toBeUndefined();
    expect(safePublisherUrl("https://user:password@example.org")).toBeUndefined();
    expect(safePublisherUrl("not a url")).toBeUndefined();
  });
});
