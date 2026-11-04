import { beforeEach, describe, expect, it } from "vitest";
import { backoffMs, gdeltFetch, resetGdeltQueue, GDELT_SPACING_MS } from "./gdelt-queue.server";

describe("GDELT queue", () => {
  beforeEach(resetGdeltQueue);
  it("retries 429 up to 3 times with 1s/2s/4s backoff", async () => {
    let calls = 0;
    const waits: number[] = [];
    let t = 0;
    const res = await gdeltFetch(
      "x",
      {},
      {
        fetch: (async () => {
          calls++;
          return new Response("", { status: 429 });
        }) as typeof fetch,
        sleep: async (ms) => {
          waits.push(ms);
          t += ms;
        },
        now: () => t,
      },
    );
    expect(res).toBeNull();
    expect(calls).toBe(4);
    expect([backoffMs(0), backoffMs(1), backoffMs(2)]).toEqual([1000, 2000, 4000]);
  });
  it("spaces requests at least 5 seconds apart", async () => {
    const starts: number[] = [];
    let t = 0;
    const deps = {
      fetch: (async () => {
        starts.push(t);
        return new Response("{}");
      }) as typeof fetch,
      sleep: async (ms: number) => {
        t += ms;
      },
      now: () => t,
    };
    await Promise.all([gdeltFetch("a", {}, deps), gdeltFetch("b", {}, deps)]);
    expect(starts[1]! - starts[0]!).toBeGreaterThanOrEqual(GDELT_SPACING_MS);
  });
});
