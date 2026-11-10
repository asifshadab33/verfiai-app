import { describe, expect, it } from "vitest";
import { partnerLinkRel, resolvePartnerLink } from "./affiliates";

describe("affiliate registry", () => {
  it("resolves known tools to their clean fallback URL when no partner link is active", () => {
    const link = resolvePartnerLink("Brevo");
    expect(link).toEqual({ href: "https://www.brevo.com/", isPartner: false });
  });

  it("falls back safely for unknown tools", () => {
    expect(resolvePartnerLink("Not A Real Tool")).toBeNull();
  });

  it("marks active partner links as sponsored", () => {
    expect(partnerLinkRel(true)).toBe("noopener noreferrer sponsored");
    expect(partnerLinkRel(false)).toBe("noopener noreferrer");
  });

  it("uses https URLs for every registered tool", () => {
    for (const name of ["Mailchimp", "Canva", "Grammarly", "Calendly"]) {
      const link = resolvePartnerLink(name);
      expect(link?.href.startsWith("https://")).toBe(true);
    }
  });
});
