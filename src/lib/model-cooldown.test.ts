import { afterEach, describe, expect, it, vi } from "vitest";
import { meter } from "./metering.server";
vi.mock("./metering.server", () => ({ meter: vi.fn(async () => {}) }));
import { callEngine, modelRoutingSummary, resetModelRoutingState, runRoute } from "./model.server";

afterEach(() => { resetModelRoutingState(); vi.unstubAllGlobals(); vi.unstubAllEnvs(); vi.restoreAllMocks(); });
function setup() {
  for (const key of ["CEREBRAS_API_KEY", "GROQ_API_KEY", "SAMBANOVA_API_KEY", "OPENROUTER_API_KEY"]) vi.stubEnv(key, "test-only");
  const route = "cerebras:first,groq:second,sambanova:third,google/gemma-4-26b-a4b-it:free";
  vi.stubEnv("MODEL_ROUTE_TRIAGE", route); vi.stubEnv("MODEL_ROUTE_EVALUATION", route);
}
const success = (content: string) => new Response(JSON.stringify({ choices: [{ message: { content } }] }), { status: 200 });

describe("provider cooldown", () => {
  it("skips a provider on the next route after a 429", async () => {
    setup();
    const first = vi.fn(async () => new Response("", { status: 429 }));
    vi.stubGlobal("fetch", first);
    await expect(callEngine("cerebras:first", "Return JSON", "test")).rejects.toThrow("rate-limited");
    const second = vi.fn(async () => success('{"ok":true}'));
    vi.stubGlobal("fetch", second);
    expect(await runRoute("triage", "Return JSON", "test")).toBe('{"ok":true}');
    expect(second).toHaveBeenCalledTimes(1);
    expect(second.mock.calls[0]?.[0]).toBe("https://api.groq.com/openai/v1/chat/completions");
  });
  it("cools a provider after a 503 as well", async () => {
    setup();
    vi.stubGlobal("fetch", vi.fn(async () => new Response("", { status: 503 })));
    await expect(callEngine("groq:second", "Return JSON", "test")).rejects.toThrow("unavailable");
    const second = vi.fn(async () => success('{"ok":true}'));
    vi.stubGlobal("fetch", second);
    await runRoute("triage", "Return JSON", "test");
    expect(String(second.mock.calls[0]?.[0])).not.toContain("groq.com");
  });
  it("falls back to the full route when every keyed provider is cooling", async () => {
    setup();
    vi.stubGlobal("fetch", vi.fn(async () => new Response("", { status: 429 })));
    await expect(runRoute("triage", "Return JSON", "test")).rejects.toThrow();
    const second = vi.fn(async () => success('{"ok":true}'));
    vi.stubGlobal("fetch", second);
    expect(await runRoute("triage", "Return JSON", "test")).toBe('{"ok":true}');
    expect(second.mock.calls[0]?.[0]).toBe("https://api.cerebras.ai/v1/chat/completions");
  });
  it("tries the provider again once the cooldown expires", async () => {
    setup(); vi.stubEnv("MODEL_COOLDOWN_MS", "1000");
    vi.stubGlobal("fetch", vi.fn(async () => new Response("", { status: 429 })));
    await expect(callEngine("cerebras:first", "Return JSON", "test")).rejects.toThrow();
    const now = vi.spyOn(Date, "now").mockReturnValue(Date.now() + 2000);
    const second = vi.fn(async () => success('{"ok":true}'));
    vi.stubGlobal("fetch", second);
    await runRoute("triage", "Return JSON", "test");
    expect(second.mock.calls[0]?.[0]).toBe("https://api.cerebras.ai/v1/chat/completions");
    now.mockRestore();
  });
  it("does not cool a provider on non-sentinel failures", async () => {
    setup();
    vi.stubGlobal("fetch", vi.fn(async () => new Response("", { status: 500 })));
    await expect(callEngine("cerebras:first", "Return JSON", "test")).rejects.toThrow("engine");
    const second = vi.fn(async () => success('{"ok":true}'));
    vi.stubGlobal("fetch", second);
    await runRoute("triage", "Return JSON", "test");
    expect(second.mock.calls[0]?.[0]).toBe("https://api.cerebras.ai/v1/chat/completions");
  });
});

describe("routing summary and rates", () => {
  it("aggregates attempts, successes and average latency per provider route", async () => {
    setup();
    vi.stubGlobal("fetch", vi.fn()
      .mockResolvedValueOnce(new Response("", { status: 500 }))
      .mockResolvedValueOnce(success('{"ok":true}')));
    await runRoute("triage", "Return JSON", "test");
    const summary = modelRoutingSummary();
    const cerebras = summary.find(r => r.provider === "cerebras");
    const groq = summary.find(r => r.provider === "groq");
    expect(cerebras).toMatchObject({ model_route: "cerebras:first", attempts: 1, successes: 0 });
    expect(groq).toMatchObject({ model_route: "groq:second", attempts: 1, successes: 1 });
    expect(groq!.avg_latency_ms).toBeGreaterThanOrEqual(0);
  });
  it("meters free-tier provider calls at $0", async () => {
    setup();
    vi.stubGlobal("fetch", vi.fn(async () => success('{"ok":true}')));
    await callEngine("cerebras:first", "Return JSON", "test");
    const call = vi.mocked(meter).mock.calls.find(([e]) => e.event === "ai_model_call")?.[0];
    expect(call?.estimatedCostUsd).toBe(0);
  });
});
