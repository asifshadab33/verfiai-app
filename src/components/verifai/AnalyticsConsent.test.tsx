// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ensureLocale } from "@/lib/locale-dictionaries";
import { siteText } from "@/lib/site-i18n";
vi.mock("@tanstack/react-router", () => ({ useLocation: () => ({ pathname: "/", searchStr: "" }), Link: ({ children, to, ...props }: { children: React.ReactNode; to: string }) => createElement("a", { href: to, ...props }, children) }));
import { AnalyticsConsent, ConsentBanner } from "./AnalyticsConsent";
afterEach(cleanup);
describe("consent banner", () => {
  it("renders nothing during server rendering", () => { expect(renderToStaticMarkup(createElement(AnalyticsConsent))).toBe(""); });
  it("allows keyboard acceptance and rejection without trapping focus", async () => {
    const onChoose = vi.fn(); const user = userEvent.setup();
    render(createElement(ConsentBanner, { lang: "en", onChoose, onClose: vi.fn() }));
    screen.getByRole("button", { name: "Accept analytics" }).focus(); await user.keyboard("{Enter}");
    expect(onChoose).toHaveBeenLastCalledWith("accepted"); await user.tab(); await user.keyboard(" ");
    expect(onChoose).toHaveBeenLastCalledWith("rejected"); await user.tab(); expect(document.activeElement).toBe(screen.getByRole("link", { name: "Privacy policy" }));
  });
  it("resolves the consent fields in all nineteen locales", async () => {
    for (const lang of ["en", "de", "ar", "es", "fr", "pt", "it", "nl", "ru", "tr", "hi", "bn", "ur", "fa", "zh", "ja", "ko", "id", "sw"] as const) {
      await ensureLocale(lang); for (const key of ["consentTitle", "consentBody", "consentAccept", "consentReject", "consentPrivacy", "cookieSettings"] as const) expect(siteText(lang, key).length).toBeGreaterThan(0);
    }
  });
});