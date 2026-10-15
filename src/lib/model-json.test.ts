import { describe, expect, it } from "vitest";
import { withJsonWord } from "./model.server";

describe("withJsonWord", () => {
  it("adds a json instruction when no message mentions json", () => {
    expect(withJsonWord("Summarize.", "Text")).toMatch(/json/i);
  });
  it("leaves prompts that already mention JSON unchanged", () => {
    expect(withJsonWord("Return JSON.", "x")).toBe("Return JSON.");
  });
});
