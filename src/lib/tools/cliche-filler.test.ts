import { describe, it, expect } from "vitest";
import { detectFillers } from "./cliche-filler";

describe("detectFillers", () => {
  it("detects common single-word fillers", () => {
    const text = "This is very important and really matters.";
    const matches = detectFillers(text);
    expect(matches.length).toBe(2);
    expect(matches[0].word).toBe("very");
    expect(matches[1].word).toBe("really");
  });

  it('detects multi-word fillers like "in order to"', () => {
    const text = "In order to succeed, we must try.";
    const matches = detectFillers(text);
    expect(matches.some((m) => m.word.toLowerCase() === "in order to")).toBe(true);
  });

  it("returns empty array for clean text without fillers", () => {
    const text = "The project completed on time.";
    expect(detectFillers(text).length).toBe(0);
  });
});
