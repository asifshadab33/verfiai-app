import { describe, expect, it, vi } from "vitest";
vi.mock("./analytics-consent", () => ({ analyticsAccepted: () => true }));
vi.mock("posthog-js", () => ({ default: { init: vi.fn(), capture: vi.fn() } }));
import posthog from "posthog-js";
import { analyticsPath, analyticsUrl, trackPage } from "./posthog";

describe("browser analytics privacy and lifecycle", () => {
  it("removes queries, hashes and private share identifiers", () => {
    expect(analyticsPath("/r/private-token?lang=de#secret")).toBe("/r/:token");
    expect(analyticsPath("/resources/private-slug")).toBe("/resources/:slug");
    expect(analyticsUrl("https://verfiai.app/auth?access_token=secret#password")).toBe(
      "https://verfiai.app/auth",
    );
  });
  it("initializes once and enables page, click and leave tracking", () => {
    vi.stubEnv("VITE_LOVABLE_CONNECTOR_POSTHOG_API_KEY", "test-project-token");
    vi.stubEnv("VITE_LOVABLE_CONNECTOR_POSTHOG_REGION", "us");
    trackPage("/");
    trackPage("/");
    trackPage("/sources");
    expect(posthog.init).toHaveBeenCalledTimes(1);
    expect(posthog.init).toHaveBeenCalledWith(
      "test-project-token",
      expect.objectContaining({
        api_host: "https://us.i.posthog.com",
        capture_pageview: "history_change",
        capture_pageleave: true,
        autocapture: true,
        mask_all_text: true,
        mask_all_element_attributes: true,
        disable_session_recording: true,
      }),
    );
    expect(posthog.capture).toHaveBeenCalledTimes(2);
    expect(posthog.capture).toHaveBeenLastCalledWith("page_view", { route_path: "/sources" });
    vi.unstubAllEnvs();
  });
});
