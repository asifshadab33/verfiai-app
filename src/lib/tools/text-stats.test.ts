import { describe, expect, it } from "vitest";
import { textStats, wordsOf } from "./text-stats";

describe("text statistics", () => {
  it("counts words, sentences and paragraphs", () => {
    const s = textStats("Hello world. This is a test.\n\nSecond paragraph here.");
    expect(s.words).toBe(9);
    expect(s.sentences).toBe(3);
    expect(s.paragraphs).toBe(2);
  });
  it("does not count punctuation as words", () => {
    expect(wordsOf("Wait... what?! Yes — really.")).toEqual(["Wait", "what", "Yes", "really"]);
  });
  it("counts characters by code point and ignores whitespace for the no-space count", () => {
    const s = textStats("a b\n😀");
    expect(s.characters).toBe(5);
    expect(s.charactersNoSpaces).toBe(3);
  });
  it("handles empty text", () => {
    const s = textStats("");
    expect([s.words, s.sentences, s.paragraphs, s.characters]).toEqual([0, 0, 0, 0]);
    expect(s.fleschReadingEase).toBeNull();
  });
  it("estimates reading time and handles CJK without a Flesch score", () => {
    expect(textStats(Array(476).fill("word").join(" ")).readingMinutes).toBe(2);
    const cjk = textStats("今天天气很好。我们去公园散步，然后回家吃饭。".repeat(30));
    expect(cjk.words).toBeGreaterThan(0);
    expect(cjk.readingMinutes).toBeGreaterThan(0);
    expect(cjk.fleschReadingEase).toBeNull();
  });
  it("scores English prose and skips other languages", () => {
    const en = textStats(
      "The quick brown fox jumps over the lazy dog. It was a bright cold day in April, and the clocks were striking thirteen. We walked to the market and bought some bread and cheese for the long journey home.",
    );
    expect(en.fleschReadingEase).not.toBeNull();
    expect(en.fleschReadingEase!).toBeGreaterThan(0);
    expect(en.fleschReadingEase!).toBeLessThan(101);
    expect(textStats("هذا نص عربي طويل نسبيا ".repeat(20)).fleschReadingEase).toBeNull();
  });
  it("lists repeated meaningful words", () => {
    const s = textStats(
      "Research needs evidence. Evidence beats opinion, and research shows evidence matters more than opinion.",
    );
    expect(s.topWords[0]).toEqual({ word: "evidence", count: 3 });
    expect(s.topWords.map((w) => w.word)).toContain("research");
    expect(s.topWords.map((w) => w.word)).not.toContain("than");
  });
});
