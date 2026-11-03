// @vitest-environment happy-dom
import { beforeEach, describe, expect, it, vi } from "vitest";
const sdk = vi.hoisted(() => ({
  google: vi.fn(),
  posthog: vi.fn(),
  stopGoogle: vi.fn(),
  stopPosthog: vi.fn(),
}));
vi.mock("./google-analytics", () => ({
  trackGooglePage: sdk.google,
  stopGoogleAnalytics: sdk.stopGoogle,
}));
vi.mock("./posthog", () => ({ trackPage: sdk.posthog, stopPosthog: sdk.stopPosthog }));
beforeEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
  localStorage.clear();
  sessionStorage.clear();
  Object.defineProperty(navigator, "globalPrivacyControl", { configurable: true, value: false });
  vi.stubEnv("VITE_LOVABLE_CONNECTOR_GOOGLE_ANALYTICS_API_KEY", "G-NSGRV2SG6X");
});
describe("analytics consent", () => {
  it("does not load or track before a choice or after rejection", async () => {
    const consent = await import("./analytics-consent");
    consent.initializeConsent();
    await consent.trackConsentedPage("/");
    expect(consent.consentChoice()).toBeNull();
    expect(sdk.google).not.toHaveBeenCalled();
    expect(sdk.posthog).not.toHaveBeenCalled();
    consent.chooseConsent("rejected");
    await consent.trackConsentedPage("/sources");
    expect(sdk.google).not.toHaveBeenCalled();
    expect(sdk.posthog).not.toHaveBeenCalled();
  });
  it("starts only the current page on acceptance and stops on withdrawal", async () => {
    const consent = await import("./analytics-consent");
    consent.initializeConsent();
    await consent.trackConsentedPage("/sources");
    consent.chooseConsent("accepted");
    await vi.waitFor(() => expect(sdk.google).toHaveBeenCalledTimes(1));
    expect(sdk.google).toHaveBeenLastCalledWith("/sources");
    expect(sdk.posthog).toHaveBeenCalledTimes(1);
    localStorage.setItem("ph_test_posthog", "identifier");
    sessionStorage.setItem("ph_test_posthog_session", "identifier");
    sessionStorage.setItem("ph_test_primary_window_exists", "true");
    sessionStorage.setItem("ph_test_session_registered_properties", "identifier");
    localStorage.setItem("auth-test", "keep");
    document.cookie = "_ga=abc; path=/";
    document.cookie = "_ga_NSGRV2SG6X=abc; path=/";
    consent.chooseConsent("rejected");
    await consent.trackConsentedPage("/privacy");
    expect(sdk.stopGoogle).toHaveBeenCalledOnce();
    expect(sdk.stopPosthog).toHaveBeenCalledOnce();
    expect((window as unknown as Record<string, unknown>)["ga-disable-G-NSGRV2SG6X"]).toBe(true);
    expect(document.cookie).not.toContain("_ga");
    expect(localStorage.getItem("ph_test_posthog")).toBeNull();
    expect(sessionStorage.length).toBe(0);
    expect(localStorage.getItem("auth-test")).toBe("keep");
    expect(sdk.google).toHaveBeenCalledTimes(1);
    const record = JSON.parse(localStorage.getItem(consent.CONSENT_STORAGE_KEY) || "null");
    expect(record).toMatchObject({ choice: "rejected", version: "2026-10-30" });
    expect(typeof record.timestamp).toBe("number");
  });
  it("remembers accepted and rejected choices on reload", async () => {
    const consent = await import("./analytics-consent");
    consent.initializeConsent();
    consent.chooseConsent("rejected");
    vi.resetModules();
    const reload = await import("./analytics-consent");
    reload.initializeConsent();
    expect(reload.consentChoice()).toBe("rejected");
    localStorage.setItem(
      consent.CONSENT_STORAGE_KEY,
      JSON.stringify({
        choice: "accepted",
        version: consent.CONSENT_VERSION,
        timestamp: Date.now(),
      }),
    );
    vi.resetModules();
    const accepted = await import("./analytics-consent");
    accepted.initializeConsent();
    expect(accepted.analyticsAccepted()).toBe(true);
  });
  it("re-prompts on a version bump or twelve-month expiry", async () => {
    const consent = await import("./analytics-consent");
    const timestamp = Date.UTC(2025, 9, 30);
    const record = { choice: "accepted", version: consent.CONSENT_VERSION, timestamp };
    expect(consent.validConsent(record, Date.UTC(2026, 9, 29))).toBe(true);
    expect(consent.validConsent(record, Date.UTC(2026, 9, 30))).toBe(false);
    expect(consent.validConsent(record, timestamp + 1, "next-version")).toBe(false);
    localStorage.setItem(
      consent.CONSENT_STORAGE_KEY,
      JSON.stringify({ ...record, version: "old" }),
    );
    consent.initializeConsent();
    expect(consent.consentChoice()).toBeNull();
  });
  it("treats GPC as refusal but permits an explicit settings opt-in", async () => {
    Object.defineProperty(navigator, "globalPrivacyControl", { configurable: true, value: true });
    const consent = await import("./analytics-consent");
    consent.initializeConsent();
    expect(consent.consentChoice()).toBe("rejected");
    await consent.trackConsentedPage("/");
    expect(sdk.google).not.toHaveBeenCalled();
    consent.chooseConsent("accepted");
    await vi.waitFor(() => expect(sdk.google).toHaveBeenCalledOnce());
  });
  it("cancels a pending import if consent is withdrawn immediately", async () => {
    const consent = await import("./analytics-consent");
    consent.initializeConsent();
    consent.chooseConsent("accepted");
    consent.chooseConsent("rejected");
    await consent.trackConsentedPage("/");
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(sdk.google).not.toHaveBeenCalled();
    expect(sdk.posthog).not.toHaveBeenCalled();
  });
});
