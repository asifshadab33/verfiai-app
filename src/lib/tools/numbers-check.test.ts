import { describe, it, expect } from "vitest";
import { checkNumbers } from "./numbers-check";
describe("checkNumbers", () => {
  it("detects missing base", () => {
    expect(checkNumbers("Sales increased by 50%").length).toBeGreaterThan(0);
  });
});
