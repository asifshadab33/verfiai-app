import { afterEach, describe, expect, it, vi } from "vitest";
vi.mock("./metering.server", () => ({ meter: vi.fn(async () => {}) }));
import { callEngine, resetModelRoutingState, runRoute, synthesize } from "./model.server";

afterEach(() => {
  resetModelRoutingState();
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});
function setup() {
  for (const key of ["CEREBRAS_API_KEY", "GROQ_API_KEY", "SAMBANOVA_API_KEY", "OPENROUTER_API_KEY"])
    vi.stubEnv(key, "test-only");
  const route = "cerebras:first,groq:second,sambanova:third,google/gemma-4-26b-a4b-it:free";
  vi.stubEnv("MODEL_ROUTE_TRIAGE", route);
  vi.stubEnv("MODEL_ROUTE_EVALUATION", route);
  vi.stubEnv("MODEL_ROTATION", "off"); // legacy-order assertions
}
const success = (content: string) =>
  new Response(JSON.stringify({ choices: [{ message: { content } }] }), { status: 200 });
describe("model cascade", () => {
  it("exhausts all four configured providers without returning fabricated output", async () => {
    setup();
    const fetcher = vi.fn(async () => new Response("", { status: 429 }));
    vi.stubGlobal("fetch", fetcher);
    await expect(synthesize("Return JSON", "test")).rejects.toThrow();
    expect(fetcher).toHaveBeenCalledTimes(4);
  });
  it("never logs credential-bearing provider response bodies", async () => {
    setup();
    const logger = vi.spyOn(console, "error").mockImplementation(() => {});
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("test-private-account-marker", { status: 402 })),
    );
    await expect(callEngine("groq:second", "Return JSON", "test")).rejects.toThrow();
    expect(logger).toHaveBeenCalledWith("model provider", "groq", "second", 402);
    expect(JSON.stringify(logger.mock.calls)).not.toContain("test-private-account-marker");
  });
  it("advances through 503, 429 and 402 to the free OpenRouter route", async () => {
    setup();
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(new Response("", { status: 503 }))
      .mockResolvedValueOnce(new Response("", { status: 429 }))
      .mockResolvedValueOnce(new Response("", { status: 402 }))
      .mockResolvedValueOnce(success('{"ok":true}'));
    vi.stubGlobal("fetch", fetcher);
    expect(await runRoute("triage", "Return JSON", "test")).toBe('{"ok":true}');
    expect(fetcher).toHaveBeenCalledTimes(4);
    expect(fetcher.mock.calls[3]?.[0]).toBe("https://openrouter.ai/api/v1/chat/completions");
  });
  it("advances on timeout and rejects malformed synthesis instead of repeating it", async () => {
    setup();
    const fetcher = vi
      .fn()
      .mockRejectedValueOnce(new DOMException("Timed out", "TimeoutError"))
      .mockResolvedValueOnce(success("not JSON"))
      .mockResolvedValueOnce(success('{"ok":true}'));
    vi.stubGlobal("fetch", fetcher);
    const result = await synthesize("Return JSON", "test", undefined, (raw) => {
      try {
        return JSON.parse(raw).ok === true;
      } catch {
        return false;
      }
    });
    expect(result.raw).toBe('{"ok":true}');
    expect(fetcher).toHaveBeenCalledTimes(3);
  });
});
