import { afterEach, describe, expect, it, vi } from "vitest";
vi.mock("./metering.server", () => ({ meter: vi.fn(async () => {}) }));
import { runRoute, synthesize } from "./model.server";

afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });
function setup() {
  for (const key of ["CEREBRAS_API_KEY", "GROQ_API_KEY", "SAMBANOVA_API_KEY", "OPENROUTER_API_KEY"]) vi.stubEnv(key, "test-only");
  const route = "cerebras:first,groq:second,sambanova:third,google/gemma-4-26b-a4b-it:free";
  vi.stubEnv("MODEL_ROUTE_TRIAGE", route); vi.stubEnv("MODEL_ROUTE_EVALUATION", route);
}
const success = (content: string) => new Response(JSON.stringify({ choices: [{ message: { content } }] }), { status: 200 });
describe("model cascade", () => {
  it("advances through 503, 429 and 402 to the free OpenRouter route", async () => {
    setup(); const fetcher = vi.fn().mockResolvedValueOnce(new Response("", { status: 503 })).mockResolvedValueOnce(new Response("", { status: 429 })).mockResolvedValueOnce(new Response("", { status: 402 })).mockResolvedValueOnce(success('{"ok":true}'));
    vi.stubGlobal("fetch", fetcher);
    expect(await runRoute("triage", "Return JSON", "test")).toBe('{"ok":true}');
    expect(fetcher).toHaveBeenCalledTimes(4);
    expect(fetcher.mock.calls[3]?.[0]).toBe("https://openrouter.ai/api/v1/chat/completions");
  });
  it("advances on timeout and rejects malformed synthesis instead of repeating it", async () => {
    setup(); const fetcher = vi.fn().mockRejectedValueOnce(new DOMException("Timed out", "TimeoutError")).mockResolvedValueOnce(success("not JSON")).mockResolvedValueOnce(success('{"ok":true}'));
    vi.stubGlobal("fetch", fetcher);
    const result = await synthesize("Return JSON", "test", undefined, raw => { try { return JSON.parse(raw).ok === true; } catch { return false; } });
    expect(result.raw).toBe('{"ok":true}'); expect(fetcher).toHaveBeenCalledTimes(3);
  });
});