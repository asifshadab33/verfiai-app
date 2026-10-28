import { describe, expect, it, vi } from "vitest";
import { makeProgressEvent, progressInput, signProgress, verifyProgress, PROGRESS_STAGES } from "./progress";

const rpc = vi.hoisted(() => vi.fn(async () => ({ error: null })));
vi.mock("./db.server", () => ({ admin: async () => ({ rpc }) }));
import { createProgressEmitter } from "./progress.server";

describe("real progress", () => {
  it("only complete reaches all five completed stages", () => {
    const id = crypto.randomUUID();
    expect(PROGRESS_STAGES.map((stage, i) => makeProgressEvent(id, stage, i + 1).completedSteps)).toEqual([0, 1, 2, 3, 4]);
    expect(makeProgressEvent(id, "complete", 6).completedSteps).toBe(5);
  });
  it("accepts signed backend events even after JSONB key reordering, rejecting spoofed or other-run events", async () => {
    const input = { runId: crypto.randomUUID(), secret: crypto.randomUUID() };
    const event = makeProgressEvent(input.runId, "search", 2);
    const signature = await signProgress(event, input.secret);
    const reordered = Object.fromEntries(Object.entries(event).reverse());
    expect(await verifyProgress({ event: reordered, signature }, input)).toEqual(event);
    expect(await verifyProgress({ event: { ...event, stage: "complete" }, signature }, input)).toBeNull();
    expect(await verifyProgress({ event, signature }, { ...input, runId: crypto.randomUUID() })).toBeNull();
    expect(await verifyProgress({ event, signature }, { ...input, secret: crypto.randomUUID() })).toBeNull();
  });
  it("validates both opaque identifiers", () => {
    expect(progressInput.safeParse({ runId: "guessed", secret: "short" }).success).toBe(false);
  });
  it("persists ordered coarse events without the secret or submitted content", async () => {
    rpc.mockClear();
    const input = { runId: crypto.randomUUID(), secret: crypto.randomUUID() };
    const emit = createProgressEmitter(input);
    await emit("validation"); await emit("search"); await emit("complete");
    expect(rpc.mock.calls.map(call => (call as unknown as [string, { p_event: { sequence: number } }])[1].p_event.sequence)).toEqual([1, 2, 3]);
    expect(JSON.stringify(rpc.mock.calls)).not.toContain(input.secret);
  });
  it("telemetry failures do not fail verification and absent subscriptions perform no writes", async () => {
    rpc.mockClear();
    await createProgressEmitter()("complete");
    expect(rpc).not.toHaveBeenCalled();
    rpc.mockRejectedValueOnce(new Error("disconnected"));
    await expect(createProgressEmitter({ runId: crypto.randomUUID(), secret: crypto.randomUUID() })("search")).resolves.toBeUndefined();
  });
});