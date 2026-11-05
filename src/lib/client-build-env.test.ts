import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("client-public build defaults", () => {
  it("retains the required public configuration without server credentials", () => {
    const env = JSON.parse(readFileSync(new URL("../../client-build-env.json", import.meta.url), "utf8")) as Record<string, string>;
    expect(Object.keys(env).sort()).toEqual([
      "VITE_LOVABLE_CONNECTOR_GOOGLE_ANALYTICS_API_KEY",
      "VITE_LOVABLE_CONNECTOR_POSTHOG_API_KEY",
      "VITE_LOVABLE_CONNECTOR_POSTHOG_PROJECT_ID",
      "VITE_LOVABLE_CONNECTOR_POSTHOG_REGION",
      "VITE_SUPABASE_PROJECT_ID",
      "VITE_SUPABASE_PUBLISHABLE_KEY",
      "VITE_SUPABASE_URL",
    ]);
    expect(env["VITE_SUPABASE_URL"]).toMatch(/^https:\/\//);
    expect(env["VITE_SUPABASE_PUBLISHABLE_KEY"]).toMatch(/^sb_publishable_/);
    expect(Object.values(env).every((value) => Boolean(value) && !value.startsWith("sb_secret_"))).toBe(true);
  });
});