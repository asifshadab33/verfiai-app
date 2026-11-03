import { describe, expect, it } from "vitest";
import { cleanText, convertCase, toSentenceCase, toTitleCase } from "./text-clean";

describe("case conversion", () => {
  it("title-cases while keeping small words, acronyms and brand casing", () => {
    expect(toTitleCase("the quick brown fox jumps over the lazy dog")).toBe(
      "The Quick Brown Fox Jumps Over the Lazy Dog",
    );
    expect(toTitleCase("a tale of two cities")).toBe("A Tale of Two Cities");
    expect(toTitleCase("using NASA data in iPhone apps")).toBe("Using NASA Data in iPhone Apps");
    expect(toTitleCase("state-of-the-art tools")).toBe("State-of-the-Art Tools");
    expect(toTitleCase("what to look at")).toBe("What to Look At");
  });
  it("sentence-cases and fixes the pronoun I", () => {
    expect(toSentenceCase("HELLO WORLD. this is i. i'm here\nnew line")).toBe(
      "Hello world. This is I. I'm here\nNew line",
    );
  });
  it("converts to camel, snake and kebab case", () => {
    expect(convertCase("Hello World-Wide web", "camel")).toBe("helloWorldWideWeb");
    expect(convertCase("Hello World-Wide web", "snake")).toBe("hello_world_wide_web");
    expect(convertCase("myVariableName", "kebab")).toBe("my-variable-name");
    expect(convertCase("MiXed", "upper")).toBe("MIXED");
    expect(convertCase("Same", "none")).toBe("Same");
  });
});

describe("text cleaning", () => {
  it("removes invisible characters and straightens quotes", () => {
    expect(
      cleanText("a\u200Bb\u00ADc “quoted” and ‘single’", {
        removeInvisible: true,
        straightenQuotes: true,
      }),
    ).toBe(`abc "quoted" and 'single'`);
  });
  it("unwraps hard-wrapped lines but keeps paragraphs", () => {
    expect(
      cleanText("This is a line\nthat wraps.\n\nNew paragraph\nhere.", { unwrapLines: true }),
    ).toBe("This is a line that wraps.\n\nNew paragraph here.");
  });
  it("repairs end-of-line hyphenation when asked", () => {
    expect(cleanText("an exam-\nple of text", { fixHyphenation: true, unwrapLines: true })).toBe(
      "an example of text",
    );
    expect(cleanText("well-\nKnown", { fixHyphenation: true })).toBe("well-\nKnown");
  });
  it("collapses spaces, trims lines and handles blank lines", () => {
    expect(
      cleanText("  a   b  \n\n\n\n c ", {
        trimLines: true,
        collapseSpaces: true,
        blankLines: "collapse",
      }),
    ).toBe("a b\n\nc");
    expect(cleanText("a\n\n\nb", { blankLines: "remove" })).toBe("a\nb");
  });
  it("removes duplicate lines ignoring case", () => {
    expect(cleanText("a\nA\nb\na", { removeDuplicateLines: true })).toBe("a\nb");
  });
  it("normalises Windows line endings", () => {
    expect(cleanText("a\r\nb\rc")).toBe("a\nb\nc");
  });
});
