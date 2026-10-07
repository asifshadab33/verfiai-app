import { describe, expect, it } from "vitest";
import { assertMonetizationEnabled, MONETIZATION_ENABLED } from "./community";

describe("community monetization policy", () => {
  it("disables monetization", () => { expect(MONETIZATION_ENABLED).toBe(false); });
  it("blocks paid checkout", () => { expect(() => assertMonetizationEnabled()).toThrow("Paid checkout is unavailable"); });
});