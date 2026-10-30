import { afterEach, describe, expect, it, vi } from "vitest";
vi.mock("./analytics-consent", () => ({ analyticsAccepted: () => true }));

afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); vi.resetModules(); });

describe("Google Analytics page visits", () => {
  it("loads once, tracks the first page and client navigation without duplicate renders", async () => {
    vi.stubEnv("VITE_LOVABLE_CONNECTOR_GOOGLE_ANALYTICS_API_KEY", "G-NSGRV2SG6X");
    const appendChild = vi.fn();
    const browser = { location: { origin: "https://verfiai.app" }, dataLayer: [] as IArguments[] };
    vi.stubGlobal("window", browser);
    vi.stubGlobal("document", { createElement: () => ({}), head: { appendChild } });
    const { trackGooglePage } = await import("./google-analytics");
    trackGooglePage("/"); trackGooglePage("/"); trackGooglePage("/sources");
    expect(appendChild).toHaveBeenCalledTimes(1);
    expect(appendChild).toHaveBeenCalledWith(expect.objectContaining({ async: true, src: "https://www.googletagmanager.com/gtag/js?id=G-NSGRV2SG6X" }));
    const commands = browser.dataLayer.map(args => Array.from(args));
    expect(commands.filter(args => args[0] === "config")).toEqual([["config", "G-NSGRV2SG6X", expect.objectContaining({ send_page_view: false })]]);
    const events = commands.filter(args => args[0] === "event");
    expect(events).toHaveLength(2);
    expect(events[1]).toEqual(["event", "page_view", expect.objectContaining({ page_path: "/sources", send_to: "G-NSGRV2SG6X" })]);
  });
  it("redacts shared tokens, queries, hashes, titles and referrers", async () => {
    vi.stubEnv("VITE_LOVABLE_CONNECTOR_GOOGLE_ANALYTICS_API_KEY", "G-NSGRV2SG6X");
    const browser = { location: { origin: "https://verfiai.app" }, dataLayer: [] as IArguments[] };
    vi.stubGlobal("window", browser);
    vi.stubGlobal("document", { createElement: () => ({}), head: { appendChild: vi.fn() } });
    const { trackGooglePage } = await import("./google-analytics");
    trackGooglePage("/r/private-token?prompt=confidential#secret");
    const event = browser.dataLayer.map(args => Array.from(args)).find(args => args[0] === "event");
    expect(event?.[2]).toMatchObject({ page_path: "/r/:token", page_location: "https://verfiai.app/r/:token", page_title: "Verfiai", page_referrer: "" });
    expect(JSON.stringify(browser.dataLayer.map(args => Array.from(args)))).not.toMatch(/private-token|confidential|secret/);
  });
  it("does nothing without a configured measurement ID", async () => {
    vi.stubEnv("VITE_LOVABLE_CONNECTOR_GOOGLE_ANALYTICS_API_KEY", "");
    const appendChild = vi.fn();
    vi.stubGlobal("window", {});
    vi.stubGlobal("document", { head: { appendChild } });
    const { trackGooglePage } = await import("./google-analytics");
    trackGooglePage("/");
    expect(appendChild).not.toHaveBeenCalled();
  });
});