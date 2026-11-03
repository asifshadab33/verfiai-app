import { describe, it, expect } from "vitest";
import { detectWeaselWords } from "./weasel-words";
describe("detectWeaselWords", () => {
  it("should detect weasel words", () => {
    const matches = detectWeaselWords("Studies show that experts agree.");
    expect(matches.length).toBe(2);
    expect(matches[0]?.word).toBe("Studies show");
  });
});
