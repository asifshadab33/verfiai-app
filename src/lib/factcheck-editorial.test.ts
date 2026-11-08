import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@tanstack/react-start", () => ({
  createServerFn: () => {
    const builder = {
      middleware: () => builder,
      validator: () => builder,
      handler: (...handlers: unknown[]) => handlers.at(-1),
    };
    return builder;
  },
}));
vi.mock("@/integrations/supabase/auth-middleware", () => ({ requireSupabaseAuth: {} }));
vi.mock("./research.server", () => ({ rerank: vi.fn(), getLanguageName: vi.fn() }));
vi.mock("./search.server", () => ({ dualAngleSearch: vi.fn() }));
vi.mock("./model.server", () => ({ runRoute: vi.fn() }));
vi.mock("./page.server", () => ({ fetchArticle: vi.fn() }));
vi.mock("./cache.server", () => ({ cacheGet: vi.fn(), cacheSet: vi.fn(), sha: (s: string) => s }));
vi.mock("./usage.server", () => ({
  identify: async () => ({ userId: "caller", fingerprint: "" }),
  claimUsage: vi.fn(async () => ({ release: vi.fn() })),
  usageFor: vi.fn(),
}));
vi.mock("./metering.server", () => ({
  consumeCredits: vi.fn(async () => ({ refund: vi.fn() })),
  meter: vi.fn(),
  CREDIT_COSTS: { quick_claim_check: 1 },
}));
vi.mock("./verification-guard.server", () => ({
  guardVerificationRequest: vi.fn(),
  getVerificationResponse: vi.fn(async () => null),
  saveVerificationResponse: vi.fn(),
  verificationResponseKey: vi.fn(() => "caller-key"),
}));
vi.mock("./flags.server", () => ({ isEnabled: vi.fn(async () => false) }));
vi.mock("./progress.server", () => ({ createProgressEmitter: () => vi.fn() }));

import { factCheck } from "./factcheck.functions";
import { dualAngleSearch } from "./search.server";
import { runRoute } from "./model.server";
import { fetchArticle } from "./page.server";
import { claimUsage } from "./usage.server";
import { consumeCredits } from "./metering.server";
import { guardVerificationRequest } from "./verification-guard.server";

afterEach(() => vi.clearAllMocks());
describe("editorial match before external work", () => {
  it("returns the dated review with zero search, extraction or model calls while retaining usage guards", async () => {
    // Builder mock exposes the handler, not the transport wrapper.
    const handler = factCheck as unknown as (input: { data: { text: string; language: string } }) => Promise<{ claims: { verdict: string; explanation: string }[] }>;
    const result = await handler({ data: { text: "Humans only use 10% of their brains.", language: "English" } });
    expect(result.claims[0]?.verdict).toBe("CONTRADICTED");
    expect(result.claims[0]?.explanation).toContain("2026-10-28");
    expect(dualAngleSearch).not.toHaveBeenCalled();
    expect(runRoute).not.toHaveBeenCalled();
    expect(fetchArticle).not.toHaveBeenCalled();
    expect(guardVerificationRequest).toHaveBeenCalledTimes(1);
    expect(claimUsage).toHaveBeenCalledTimes(1);
    expect(consumeCredits).toHaveBeenCalledTimes(1);
  });
});