import { describe, expect, it } from "vitest";
import { dictionary, ensureLocale } from "./locale-dictionaries";
import { siteText } from "./site-i18n";
import { languages } from "./translations";

describe("lazy locale dictionaries", () => {
  it("keeps English ready without loading a secondary locale", () => {
    expect(dictionary("en")).toBeDefined();
    expect(dictionary("de")).toBeUndefined();
    expect(dictionary("invalid")).toBeUndefined();
  });
  it("deduplicates active-locale loading and preserves all nineteen locales", async () => {
    const [first, second] = await Promise.all([ensureLocale("de"), ensureLocale("de")]);
    expect(first).toBe(second);
    expect(dictionary("de")).toBe(first);
    expect(dictionary("ja")).toBeUndefined();
    for (const { code } of languages) {
      const result = await ensureLocale(code);
      expect(Object.keys(result.site).length).toBeGreaterThan(100);
      expect(Object.keys(result.recent).length).toBeGreaterThan(100);
      expect(dictionary(code)).toBe(result);
    }
    expect(languages).toHaveLength(19);
  });
  it("serves the nav labels the dictionaries omit from the English fallback", async () => {
    await ensureLocale("ar");
    // The Arabic site dictionary must stay without these keys, so the fallback is the active path.
    expect(dictionary("ar")?.site.navAbout).toBeUndefined();
    expect(dictionary("ar")?.site.navAccuracy).toBeUndefined();
    expect(siteText("ar", "navAbout")).toBe("About");
    expect(siteText("ar", "navAccuracy")).toBe("Accuracy");
    expect(siteText("en", "navAbout")).toBe("About");
    expect(siteText("en", "navAccuracy")).toBe("Accuracy");
  });
});
