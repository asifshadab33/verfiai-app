import { describe, expect, it } from "vitest";
import { ensureLocale } from "./locale-dictionaries";
import { recentText } from "./recent-i18n";
import { languages } from "./translations";

const WAITLIST_ENGLISH = [
  "Word",
  "Future Pro & Teams",
  "Join the waitlist for future Pro and Teams features. No payment, subscription or commitment.",
  "You’re on the waitlist. We’ll contact you about future Pro and Teams features.",
  "Analyst community waitlist",
  "For journalists, researchers, analysts and compliance teams who want early access to the Evidence Library and Analyst features when they open. Free, no commitment.",
  "You’re on the Analyst waitlist. We’ll email you when Analyst features open.",
  "future Pro and Teams features",
  "Analyst features and early access",
  "Email address",
  "Leave blank",
  "I agree to receive emails about {topic}. I can withdraw consent at any time by emailing hello@verfiai.app. See our {privacyLink}.",
  "Privacy Policy",
  "Joining…",
  "Join the waitlist",
  "Please try again.",
  "Too many requests. Please try again in an hour.",
  "We couldn’t save your email. Please try again.",
];

describe("waitlist and report-label translations", () => {
  it("translates every waitlist string in all 19 locales", async () => {
    for (const { code } of languages) {
      await ensureLocale(code);
      for (const english of WAITLIST_ENGLISH) {
        const translated = recentText(code, english);
        expect(translated, `${code}: ${english}`).toBeTruthy();
        // "Word" legitimately stays "Word" in many locales; every other string must be translated.
        if (code !== "en" && english !== "Word")
          expect(translated, `${code} left untranslated: ${english}`).not.toBe(english);
      }
    }
  });
  it("keeps {topic} and {privacyLink} placeholders intact in every consent translation", async () => {
    const consent =
      "I agree to receive emails about {topic}. I can withdraw consent at any time by emailing hello@verfiai.app. See our {privacyLink}.";
    for (const { code } of languages) {
      await ensureLocale(code);
      const translated = recentText(code, consent, { topic: "X", privacyLink: "{privacyLink}" });
      expect(translated, code).toContain("X");
      expect(translated.split("{privacyLink}")).toHaveLength(2);
      expect(translated, code).toContain("hello@verfiai.app");
    }
  });
  it("translates the ReportView section headings in spot-checked locales", async () => {
    await ensureLocale("ar");
    await ensureLocale("zh");
    expect(recentText("ar", "Executive summary")).toBe("ملخص تنفيذي");
    expect(recentText("ar", "Background")).toBe("الخلفية");
    expect(recentText("zh", "Executive summary")).toBe("执行摘要");
    expect(recentText("zh", "Word")).toBe("Word");
  });
});
