import { afterEach, describe, expect, it, vi } from "vitest";
import {
  REGEX_MAX_INPUT_LENGTH,
  REGEX_MAX_PATTERN_LENGTH,
  runRegexInWorker,
  validateRegexInput,
} from "./regex-tester";

function mockWorker() {
  return {
    onmessage: null as ((event: MessageEvent) => void) | null,
    onerror: null as ((event: ErrorEvent) => void) | null,
    postMessage: vi.fn(),
    terminate: vi.fn(),
  };
}

afterEach(() => vi.useRealTimers());

describe("regex tester safety", () => {
  it("accepts values at the documented length caps", () => {
    expect(() =>
      validateRegexInput("a".repeat(REGEX_MAX_PATTERN_LENGTH), "x".repeat(REGEX_MAX_INPUT_LENGTH)),
    ).not.toThrow();
  });

  it("rejects overlong patterns and inputs", () => {
    expect(() => validateRegexInput("a".repeat(REGEX_MAX_PATTERN_LENGTH + 1), "")).toThrow(/1,000 characters/);
    expect(() => validateRegexInput("a", "x".repeat(REGEX_MAX_INPUT_LENGTH + 1))).toThrow(/100 KB/);
  });

  it("terminates a worker when the execution deadline is exceeded", async () => {
    vi.useFakeTimers();
    const worker = mockWorker();
    const pending = runRegexInWorker("(.+)+$", "aaaaaaaa", "g", 25, () => worker);
    const assertion = expect(pending).rejects.toThrow(/Pattern is too complex/);
    await vi.advanceTimersByTimeAsync(25);
    await assertion;
    expect(worker.terminate).toHaveBeenCalledOnce();
  });

  it("returns worker matches and terminates the worker", async () => {
    const worker = mockWorker();
    const pending = runRegexInWorker("\\d+", "a12b", "g", 100, () => worker);
    worker.onmessage?.({ data: { ok: true, matches: [{ value: "12", index: 1 }] } } as MessageEvent);
    await expect(pending).resolves.toEqual([{ value: "12", index: 1 }]);
    expect(worker.terminate).toHaveBeenCalledOnce();
  });
  it("clamps excessive or infinite timeouts to 200ms", async () => {
    vi.useFakeTimers();
    for (const timeout of [999999, Infinity, NaN]) {
      const worker = mockWorker();
      const pending = runRegexInWorker("(a+)+$", "aaaa!", "g", timeout, () => worker);
      const assertion = expect(pending).rejects.toThrow(/too complex/);
      await vi.advanceTimersByTimeAsync(200);
      await assertion;
      expect(worker.terminate).toHaveBeenCalledOnce();
      expect(worker.onmessage).toBeNull();
    }
  });
  it("terminates immediately when dispatch throws", async () => {
    const worker = mockWorker();
    worker.postMessage.mockImplementation(() => { throw new Error("dispatch failed"); });
    await expect(runRegexInWorker("a", "a", "g", 200, () => worker)).rejects.toThrow(/safe regex tester/);
    expect(worker.terminate).toHaveBeenCalledOnce();
  });
  it("terminates on worker errors and invalid patterns", async () => {
    const worker = mockWorker();
    const pending = runRegexInWorker("[", "a", "g", 200, () => worker);
    worker.onmessage?.({ data: { ok: false, error: "Invalid regular expression" } } as MessageEvent);
    await expect(pending).rejects.toThrow(/Invalid regular expression/);
    expect(worker.terminate).toHaveBeenCalledOnce();
    const crashed = mockWorker();
    const failure = runRegexInWorker("a", "a", "g", 200, () => crashed);
    crashed.onerror?.({} as ErrorEvent);
    await expect(failure).rejects.toThrow(/too complex/);
    expect(crashed.terminate).toHaveBeenCalledOnce();
  });
  it("rejects duplicate and incompatible flags before starting a worker", () => {
    const factory = vi.fn(mockWorker);
    for (const flags of ["gg", "uv", "z"]) expect(() => runRegexInWorker("a", "a", flags, 200, factory)).toThrow(/flags/);
    expect(factory).not.toHaveBeenCalled();
  });
});
