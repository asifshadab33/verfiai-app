import posthog from "posthog-js";
import { analyticsAccepted } from "./analytics-consent";

let initialized = false;
let previousPath: string | undefined;
let stopped = false;

/** Strip private identifiers and queries before sending analytics. */
export function analyticsPath(path: string) {
  return (path.split(/[?#]/)[0] ?? "/")
    .replace(/^\/r\/[^/]+/, "/r/:token")
    .replace(/^\/fact-check\/[^/]+/, "/fact-check/:slug")
    .replace(/^\/resources\/[^/]+/, "/resources/:slug");
}
export function analyticsUrl(value: unknown): unknown {
  if (typeof value !== "string") return value;
  try { const url = new URL(value); return url.origin + analyticsPath(url.pathname); }
  catch { return ""; }
}

/** Dynamically imported by the root layout only after hydration. */
export function trackPage(path: string) {
  const token = import.meta.env["VITE_LOVABLE_CONNECTOR_POSTHOG_API_KEY"];
  if (!token || !analyticsAccepted()) return;
  if (initialized && stopped) {
    posthog.opt_in_capturing({ captureEventName: false });
    stopped = false;
  }
  if (!initialized) {
    posthog.init(token, {
      api_host: import.meta.env["VITE_LOVABLE_CONNECTOR_POSTHOG_REGION"] === "us" ? "https://us.i.posthog.com" : "https://eu.i.posthog.com",
      capture_pageview: "history_change", capture_pageleave: true, autocapture: true,
      mask_all_text: true, mask_all_element_attributes: true,
      disable_session_recording: true, person_profiles: "never", persistence: "localStorage",
      save_referrer: false, save_campaign_params: false,
      before_send: event => {
        if (!event || !analyticsAccepted()) return null;
        for (const key of ["$current_url", "$referrer", "$initial_current_url", "$initial_referrer", "$prev_pageview_url"]) {
          if (key in event.properties) event.properties[key] = analyticsUrl(event.properties[key]);
        }
        for (const key of ["$pathname", "$prev_pageview_pathname"]) {
          const value = event.properties[key];
          if (typeof value === "string") event.properties[key] = analyticsPath(value);
        }
        delete event.properties["$title"];
        return event;
      },
    });
    initialized = true;
  }
  if (previousPath === path) return;
  previousPath = path;
  posthog.capture("page_view", { route_path: analyticsPath(path) });
}

export function stopPosthog() {
  if (initialized) posthog.opt_out_capturing();
  stopped = true;
  previousPath = undefined;
}