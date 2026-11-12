import { describe, expect, it } from "vitest";
import { isOfflineSupportAllowed as ok } from "./offline-support";

describe("offline support guard", () => {
  it("runs on the published domains", () => {
    expect(ok("verfiai.app", "", false, true)).toBe(true);
    expect(ok("verfiai-app.lovable.app", "", false, true)).toBe(true);
  });
  it("never runs in previews, frames, dev or with ?sw=off", () => {
    expect(ok("id-preview--54c827e9.lovable.app", "", false, true)).toBe(false);
    expect(ok("x.lovableproject.com", "", false, true)).toBe(false);
    expect(ok("verfiai.app", "", true, true)).toBe(false);
    expect(ok("verfiai.app", "", false, false)).toBe(false);
    expect(ok("verfiai.app", "?sw=off", false, true)).toBe(false);
  });
});
