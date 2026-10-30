import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
vi.mock("./metering.server", () => ({ meter: vi.fn(async () => {}) }));
const spend = { usd: 0 };
vi.mock("./db.server", () => ({
  admin: async () => {
    const q: Record<string, unknown> = {};
    for (const k of ["from", "select", "eq", "gte"]) q[k] = () => q;
    q["limit"] = async () => ({ data: [{ estimated_cost_usd: spend.usd }], error: null });
    return q;
  },
}));
import { callEngine, getRoute, ROUTES, resetModelRoutingState, rotateRoute, runRoute } from "./model.server";

const MIN = 60_000;
const ROUTE = ["cerebras:a", "groq:b", "deepseek:paid", "sambanova:c", "gemini:g", "lovable:google/gemini-2.5-flash-lite", "google/gemma-4-26b-a4b-it:free", "mistral:m"];
const success = (content = '{"ok":true}') => new Response(JSON.stringify({ choices: [{ message: { content } }] }), { status: 200 });
const firstHost = (f: ReturnType<typeof vi.fn>) => new URL(String(f.mock.calls[0]?.[0])).host;

beforeEach(() => { vi.useFakeTimers(); spend.usd = 0; });
afterEach(() => { resetModelRoutingState(); vi.useRealTimers(); vi.unstubAllGlobals(); vi.unstubAllEnvs(); });
function keys() { for (const k of ["CEREBRAS_API_KEY", "GROQ_API_KEY", "SAMBANOVA_API_KEY", "OPENROUTER_API_KEY", "DEEPSEEK_API_KEY", "GEMINI_API_KEY", "LOVABLE_API_KEY", "MISTRAL_API_KEY"]) vi.stubEnv(k, "test-only"); }

describe("provider rotation", () => {
  it("rotates the leader by minute and is stable within a minute", () => {
    const at = (slot: number, sec = 0) => rotateRoute(ROUTE, slot * MIN + sec * 1000)[0];
    // slot 1: pool providers (lovable excluded) = cerebras, groq, sambanova, openrouter:free
    expect(at(1)).toBe("groq:b");
    expect(at(1, 59)).toBe("groq:b");
    expect(at(2)).toBe("sambanova:c");
    expect(at(3)).toBe("google/gemma-4-26b-a4b-it:free");
  });
  it("never lets paid models or gemini lead and keeps them in route order as the tail", () => {
    for (let slot = 0; slot < 30; slot++) {
      const order = rotateRoute(ROUTE, slot * MIN);
      expect(["deepseek:paid", "gemini:g", "mistral:m"]).not.toContain(order[0]);
      expect(order.slice(-3)).toEqual(["deepseek:paid", "gemini:g", "mistral:m"]);
    }
  });
  it("lets lovable lead only on its share slot", () => {
    vi.stubEnv("LOVABLE_AI_EVERY", "5");
    const leaders = Array.from({ length: 20 }, (_, s) => rotateRoute(ROUTE, s * MIN)[0]);
    leaders.forEach((l, s) => { if (l?.startsWith("lovable:")) expect(s % 5).toBe(0); });
    // slot 4: lovable is a pool fallback, after free providers, before paid
    const o = rotateRoute(ROUTE, 4 * MIN);
    expect(o.indexOf("lovable:google/gemini-2.5-flash-lite")).toBe(4);
    // slot 20: providers = cerebras, groq, sambanova, lovable, openrouter:free → 20 % 5 = 0 → cerebras; slot 15 → cerebras too; slot 10 → cerebras.
    expect(rotateRoute(ROUTE, 3 * 5 * MIN)).toContain("lovable:google/gemini-2.5-flash-lite");
  });
  it("skips a would-be leader with a poor recent success rate", async () => {
    keys(); vi.stubEnv("MODEL_ROUTE_TRIAGE", "cerebras:a,groq:b"); vi.stubEnv("PROVIDER_COOLDOWN_MS", "1");
    vi.stubGlobal("fetch", vi.fn(async () => new Response("", { status: 429 })));
    for (let i = 0; i < 5; i++) await expect(callEngine("cerebras:a", "json", "x")).rejects.toThrow();
    vi.advanceTimersByTime(10);
    vi.setSystemTime(2 * MIN); // slot 2 → cerebras would lead
    expect(rotateRoute(["cerebras:a", "groq:b"])[0]).toBe("groq:b");
  });
  it("MODEL_ROTATION=off yields the original order", () => {
    vi.stubEnv("MODEL_ROTATION", "off");
    expect(rotateRoute(ROUTE, 7 * MIN)).toEqual(ROUTE);
  });
});

describe("lovable policy", () => {
  const route = "lovable:google/gemini-2.5-flash-lite,cerebras:a";
  it("leads on its slot when enabled and under cap", async () => {
    keys(); vi.stubEnv("MODEL_ROUTE_TRIAGE", route); vi.setSystemTime(0);
    const f = vi.fn(async () => success()); vi.stubGlobal("fetch", f);
    await runRoute("triage", "json", "x");
    expect(firstHost(f)).toBe("ai.gateway.lovable.dev");
  });
  it("is dropped when disabled", async () => {
    keys(); vi.stubEnv("MODEL_ROUTE_TRIAGE", route); vi.stubEnv("LOVABLE_AI_ENABLED", "false"); vi.setSystemTime(0);
    const f = vi.fn(async () => success()); vi.stubGlobal("fetch", f);
    await runRoute("triage", "json", "x");
    expect(f.mock.calls.every(c => !String(c[0]).includes("lovable"))).toBe(true);
  });
  it("is dropped when the monthly cap is reached", async () => {
    keys(); vi.stubEnv("MODEL_ROUTE_TRIAGE", route); vi.setSystemTime(0); spend.usd = 1.0;
    const f = vi.fn(async () => new Response("", { status: 500 })); vi.stubGlobal("fetch", f);
    await expect(runRoute("triage", "json", "x")).rejects.toThrow();
    expect(f.mock.calls.every(c => !String(c[0]).includes("lovable"))).toBe(true);
  });
  it("sends gpt-5-nano without temperature and with max_completion_tokens", async () => {
    keys(); const f = vi.fn(async (_u: string, _i: RequestInit) => success()); vi.stubGlobal("fetch", f);
    await callEngine("lovable:openai/gpt-5-nano", "json", "x");
    const body = JSON.parse(String(f.mock.calls[0]?.[1]?.body));
    expect(body.temperature).toBeUndefined(); expect(body.max_tokens).toBeUndefined(); expect(body.max_completion_tokens).toBe(3500);
  });
});

describe("broadened cooldown", () => {
  const route = "cerebras:a,groq:b";
  async function cooledAfter(fail: () => Promise<Response> | Response, times: number) {
    keys(); vi.stubEnv("MODEL_ROUTE_TRIAGE", route); vi.stubEnv("MODEL_ROTATION", "off");
    vi.stubGlobal("fetch", vi.fn(fail));
    for (let i = 0; i < times; i++) await expect(callEngine("cerebras:a", "json", "x")).rejects.toThrow();
    const f = vi.fn(async () => success()); vi.stubGlobal("fetch", f);
    await runRoute("triage", "json", "x");
    return firstHost(f) !== "api.cerebras.ai";
  }
  for (const status of [429, 503, 401, 402, 403, 500]) it(`cools immediately on ${status}`, async () => { expect(await cooledAfter(() => new Response("", { status }), 1)).toBe(true); });
  it("cools immediately on timeout/abort", async () => { expect(await cooledAfter(() => { throw new DOMException("t", "TimeoutError"); }, 1)).toBe(true); });
  it("does not cool on a single 400 or empty output", async () => {
    expect(await cooledAfter(() => new Response("", { status: 400 }), 2)).toBe(false);
    resetModelRoutingState();
    expect(await cooledAfter(() => success(""), 2)).toBe(false);
  });
  it("cools after 3 consecutive 400/empty/invalid-JSON failures", async () => {
    expect(await cooledAfter(() => new Response("", { status: 404 }), 3)).toBe(true);
    resetModelRoutingState();
    expect(await cooledAfter(() => new Response("not json", { status: 200 }), 3)).toBe(true);
  });
  it("a success clears the consecutive soft-failure count", async () => {
    keys(); vi.stubEnv("MODEL_ROUTE_TRIAGE", route); vi.stubEnv("MODEL_ROTATION", "off");
    const bad = () => new Response("", { status: 400 });
    vi.stubGlobal("fetch", vi.fn(async () => bad()));
    for (let i = 0; i < 2; i++) await expect(callEngine("cerebras:a", "json", "x")).rejects.toThrow();
    vi.stubGlobal("fetch", vi.fn(async () => success())); await callEngine("cerebras:a", "json", "x");
    expect(await cooledAfter(bad, 2)).toBe(false);
  });
  it("skips cooling providers and falls back to the full list when all are cooling", async () => {
    keys(); vi.stubEnv("MODEL_ROUTE_TRIAGE", route);
    vi.stubGlobal("fetch", vi.fn(async () => new Response("", { status: 429 })));
    await expect(runRoute("triage", "json", "x")).rejects.toThrow();
    const f = vi.fn(async () => success()); vi.stubGlobal("fetch", f);
    expect(await runRoute("triage", "json", "x")).toBe('{"ok":true}');
  });
  it("honors PROVIDER_COOLDOWN_MS expiry", async () => {
    vi.stubEnv("PROVIDER_COOLDOWN_MS", "1000");
    expect(await cooledAfter(() => new Response("", { status: 429 }), 1)).toBe(true);
    vi.advanceTimersByTime(1500);
    const f = vi.fn(async () => success()); vi.stubGlobal("fetch", f);
    await runRoute("triage", "json", "x");
    expect(firstHost(f)).toBe("api.cerebras.ai");
  });
});

describe("route tables", () => {
  it("still respects env route overrides", () => {
    vi.stubEnv("MODEL_ROUTE_EVALUATION", "groq:x, cerebras:y");
    expect(getRoute("evaluation")).toEqual(["groq:x", "cerebras:y"]);
  });
  it("still leads with cerebras/groq/sambanova and places lovable before paid models", () => {
    expect(ROUTES.triage[0]).toBe("cerebras:llama-3.3-70b");
    expect(ROUTES.evaluation.slice(0, 3)).toEqual(["cerebras:llama-3.3-70b", "groq:openai/gpt-oss-120b", "sambanova:Meta-Llama-3.3-70B-Instruct"]);
    for (const r of [ROUTES.triage, ROUTES.evaluation] as readonly (readonly string[])[]) {
      expect(r.indexOf("lovable:openai/gpt-5-nano")).toBeLessThan(r.indexOf("gemini:gemini-3.8-flash"));
      expect(r.indexOf("lovable:google/gemini-2.5-flash-lite")).toBeGreaterThan(r.indexOf("nvidia/nemotron-3-super-120b-a12b:free"));
    }
  });
});
