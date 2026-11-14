import { afterEach, describe, expect, it, vi } from "vitest";
import { Worker as ThreadWorker } from "node:worker_threads";
import { readFileSync } from "node:fs";
import ts from "typescript";
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

  it("ignores late callbacks from a terminated worker and clears its timers", async () => {
    vi.useFakeTimers();
    const worker = mockWorker();
    const pending = runRegexInWorker("(a+)+$", "a".repeat(100) + "!", "g", 25, () => worker);
    const lateMessage = worker.onmessage;
    const lateError = worker.onerror;
    const assertion = expect(pending).rejects.toThrow(/too complex/);
    await vi.advanceTimersByTimeAsync(25);
    await assertion;
    lateMessage?.({ data: { ok: true, matches: [] } } as MessageEvent);
    lateError?.({} as ErrorEvent);
    expect(worker.onmessage).toBeNull();
    expect(worker.onerror).toBeNull();
    expect(worker.terminate).toHaveBeenCalledOnce();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("keeps the main event loop responsive while terminating actual catastrophic backtracking", async () => {
    // Execute the application's worker implementation in a real separate thread, not a mock.
    const source = readFileSync(new URL("./regex-tester.worker.ts", import.meta.url), "utf8");
    const compiled = ts.transpileModule(source, {
      compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS },
    }).outputText;
    const thread = new ThreadWorker(`
      const { parentPort } = require('node:worker_threads');
      globalThis.self = { postMessage: data => parentPort.postMessage(data) };
      ${compiled}
      parentPort.on('message', data => {
        parentPort.postMessage({ started: true });
        self.onmessage({ data });
      });
      parentPort.postMessage({ ready: true });
    `, { eval: true });
    let exited = false;
    const exit = new Promise<void>((resolve) => thread.once("exit", () => { exited = true; resolve(); }));
    let started = false;
    const worker = mockWorker();
    let ticks = 0;
    let ticksAtStart = 0;
    const heartbeat = setInterval(() => { ticks++; }, 5);
    thread.on("message", (data) => {
      if (data.started) { started = true; ticksAtStart = ticks; }
      else if (!data.ready) worker.onmessage?.({ data } as MessageEvent);
    });
    thread.on("error", () => worker.onerror?.({} as ErrorEvent));
    worker.postMessage.mockImplementation((data) => thread.postMessage(data));
    worker.terminate.mockImplementation(() => { void thread.terminate(); });
    try {
      await new Promise<void>((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error("Worker did not become ready")), 2000);
        thread.once("message", () => { clearTimeout(timer); resolve(); });
      });
      await expect(runRegexInWorker("(a+)+$", "a".repeat(10000) + "!", "g", 200, () => worker))
        .rejects.toThrow(/too complex/);
      expect(started).toBe(true);
      expect(ticks - ticksAtStart).toBeGreaterThanOrEqual(3);
      expect(worker.terminate).toHaveBeenCalledOnce();
      await exit;
      expect(exited).toBe(true);
    } finally {
      clearInterval(heartbeat);
      if (!exited) await thread.terminate();
    }
  }, 5000);

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
