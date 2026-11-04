import { readFileSync } from "node:fs";
import { afterEach, describe, expect, it, vi } from "vitest";

const { getRequest } = vi.hoisted(() => ({ getRequest: vi.fn() }));

vi.mock("@tanstack/react-start/server", () => ({ getRequest }));

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const protectedFunctions = [
  { file: "./factcheck.functions.ts", name: "factCheck" },
  { file: "./verify.functions.ts", name: "verifyCitations" },
  { file: "./tools.functions.ts", name: "lookupDois" },
  { file: "./tools.functions.ts", name: "formatDois" },
];

describe("authentication for URL and citation lookups", () => {
  it.each(protectedFunctions)("$name requires the shared auth middleware", ({ file, name }) => {
    const source = readFileSync(new URL(file, import.meta.url), "utf8");
    const start = source.indexOf(`export const ${name} = createServerFn`);
    expect(start).toBeGreaterThanOrEqual(0);
    const nextFunction = source.indexOf("\nexport const ", start + 1);
    const body = source.slice(start, nextFunction < 0 ? undefined : nextFunction);
    expect(body).toContain(".middleware([requireSupabaseAuth])");
  });

  it("rejects a signed-out request before the protected handler continues", async () => {
    vi.stubEnv("SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("SUPABASE_PUBLISHABLE_KEY", "sb_publishable_test");
    getRequest.mockReturnValue(new Request("https://verfiai.app/_serverFn", { method: "POST" }));

    const server = requireSupabaseAuth.options.server;
    expect(server).toBeDefined();
    const next = vi.fn(async () => {
      throw new Error("The protected handler must not run for signed-out requests.");
    });

    await expect(
      server!({
        data: undefined,
        context: null as never,
        next,
        method: "POST",
        serverFnMeta: {
          id: "signed-out-test",
          name: "test",
          filename: "url-fetch-auth.server.test.ts",
        },
        signal: new AbortController().signal,
      }),
    ).rejects.toThrow("Unauthorized: No authorization header provided");
    expect(next).not.toHaveBeenCalled();
  });
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.clearAllMocks();
});
