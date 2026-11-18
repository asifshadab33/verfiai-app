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
    onmessageerror: null as ((event: MessageEvent) => void) | null,
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

  it("terminates every worker across repeated timeouts and keeps the main thread responsive", async () => {
    const source = readFileSync(new URL("./regex-tester.worker.ts", import.meta.url), "utf8");
    const compiled = ts.transpileModule(source, {
      compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS },
    }).outputText;
    let ticks = 0;
    const heartbeat = setInterval(() => { ticks++; }, 5);
    const threads: ThreadWorker[] = [];
    try {
      for (let round = 0; round < 3; round++) {
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
        threads.push(thread);
        let exited = false;
        const exit = new Promise<void>((resolve) => thread.once("exit", () => { exited = true; resolve(); }));
        const worker = mockWorker();
        thread.on("message", (data) => {
          if (!data.ready && !data.started) worker.onmessage?.({ data } as MessageEvent);
        });
        thread.on("error", () => worker.onerror?.({} as ErrorEvent));
        worker.postMessage.mockImplementation((data) => thread.postMessage(data));
        worker.terminate.mockImplementation(() => { void thread.terminate(); });
        await new Promise<void>((resolve, reject) => {
          const timer = setTimeout(() => reject(new Error("Worker did not become ready")), 2000);
          thread.once("message", () => { clearTimeout(timer); resolve(); });
        });
        const ticksAtStart = ticks;
        await expect(runRegexInWorker("(a+)+$", "a".repeat(10000) + "!", "g", 200, () => worker))
          .rejects.toThrow(/too complex/);
        expect(worker.terminate).toHaveBeenCalledOnce();
        expect(ticks - ticksAtStart).toBeGreaterThanOrEqual(3);
        await exit;
        expect(exited).toBe(true);
      }
      // Each round spawned and terminated its own worker; none linger.
      expect(threads).toHaveLength(3);
      for (const thread of threads) expect(thread.threadId).toBe(-1);
    } finally {
      clearInterval(heartbeat);
      await Promise.all(threads.map((thread) => thread.terminate()));
    }
  }, 15000);

  it("leaves no workers running or timers pending after consecutive timeouts", async () => {
    vi.useFakeTimers();
    const workers: ReturnType<typeof mockWorker>[] = [];
    const factory = vi.fn(() => {
      const worker = mockWorker();
      workers.push(worker);
      return worker;
    });
    // Run several consecutive catastrophic timeouts without any worker ever responding.
    for (let round = 0; round < 5; round++) {
      const pending = runRegexInWorker("(a+)+$", "a".repeat(100) + "!", "g", 25, factory);
      const assertion = expect(pending).rejects.toThrow(/too complex/);
      await vi.advanceTimersByTimeAsync(25);
      await assertion;
    }
    // Every spawned worker was terminated exactly once and fully detached.
    expect(factory).toHaveBeenCalledTimes(5);
    expect(workers).toHaveLength(5);
    for (const worker of workers) {
      expect(worker.terminate).toHaveBeenCalledOnce();
      expect(worker.onmessage).toBeNull();
      expect(worker.onerror).toBeNull();
    }
    // No timeout or interval from any round is still pending.
    expect(vi.getTimerCount()).toBe(0);
  });

  it("stress: many consecutive timeout cycles leak no workers, handlers, or timers", async () => {
    vi.useFakeTimers();
    const cycles = 50;
    const workers: ReturnType<typeof mockWorker>[] = [];
    const factory = vi.fn(() => {
      const worker = mockWorker();
      workers.push(worker);
      return worker;
    });
    // Hammer the runner with back-to-back timeouts, none of which ever respond.
    for (let cycle = 0; cycle < cycles; cycle++) {
      const pending = runRegexInWorker("(.+)+$", "a".repeat(200) + "!", "g", 10, factory);
      const assertion = expect(pending).rejects.toThrow(/too complex/);
      await vi.advanceTimersByTimeAsync(10);
      await assertion;
    }
    // Every cycle spawned exactly one worker, and every one was terminated exactly once.
    expect(factory).toHaveBeenCalledTimes(cycles);
    expect(workers).toHaveLength(cycles);
    for (const worker of workers) {
      expect(worker.terminate).toHaveBeenCalledOnce();
      expect(worker.onmessage).toBeNull();
      expect(worker.onerror).toBeNull();
    }
    // After the final cycle the environment is clean: no pending timers at all.
    expect(vi.getTimerCount()).toBe(0);
  });

  it("cleans up exactly once when a worker completes just as its timeout fires", async () => {
    vi.useFakeTimers();
    const worker = mockWorker();
    const pending = runRegexInWorker("\\d+", "a12b", "g", 25, () => worker);
    // Deliver the result on the very tick the deadline timer would fire.
    await vi.advanceTimersByTimeAsync(24);
    worker.onmessage?.({ data: { ok: true, matches: [{ value: "12", index: 1 }] } } as MessageEvent);
    await vi.advanceTimersByTimeAsync(100);
    // The result wins, the deadline rejection never fires, and cleanup ran once.
    await expect(pending).resolves.toEqual([{ value: "12", index: 1 }]);
    expect(worker.terminate).toHaveBeenCalledOnce();
    expect(worker.onmessage).toBeNull();
    expect(worker.onerror).toBeNull();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("cleans up exactly once when a worker throws just as its timeout fires", async () => {
    vi.useFakeTimers();
    const worker = mockWorker();
    const pending = runRegexInWorker("(a+)+$", "a".repeat(100) + "!", "g", 25, () => worker);
    const assertion = expect(pending).rejects.toThrow(/too complex/);
    // The worker errors on the tick just before the deadline timer would fire.
    await vi.advanceTimersByTimeAsync(24);
    worker.onerror?.({} as ErrorEvent);
    await vi.advanceTimersByTimeAsync(100);
    await assertion;
    // The error rejection wins, the deadline never fires again, cleanup ran once.
    expect(worker.terminate).toHaveBeenCalledOnce();
    expect(worker.onmessage).toBeNull();
    expect(worker.onerror).toBeNull();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("cleans up exactly once when the timeout fires just before the worker throws", async () => {
    vi.useFakeTimers();
    const worker = mockWorker();
    const pending = runRegexInWorker("(a+)+$", "a".repeat(100) + "!", "g", 25, () => worker);
    const assertion = expect(pending).rejects.toThrow(/too complex/);
    // The deadline fires first; the worker errors on the very next tick.
    await vi.advanceTimersByTimeAsync(25);
    worker.onerror?.({} as ErrorEvent);
    await vi.advanceTimersByTimeAsync(100);
    await assertion;
    // The timeout rejection wins, the late error is ignored, cleanup ran once.
    expect(worker.terminate).toHaveBeenCalledOnce();
    expect(worker.onmessage).toBeNull();
    expect(worker.onerror).toBeNull();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("rejects and cleans up exactly once across repeated timeout events", async () => {
    vi.useFakeTimers();
    const worker = mockWorker();
    const pending = runRegexInWorker("(a+)+$", "a".repeat(100) + "!", "g", 25, () => worker);
    let rejections = 0;
    const tracked = pending.catch((error) => { rejections++; throw error; });
    const assertion = expect(tracked).rejects.toThrow(/too complex/);
    // The deadline fires; afterwards every worker event channel fires again.
    await vi.advanceTimersByTimeAsync(25);
    const lateMessage = worker.onmessage;
    const lateError = worker.onerror;
    const lateMessageError = worker.onmessageerror;
    await vi.advanceTimersByTimeAsync(100);
    await assertion;
    // Repeated late events are all ignored: one rejection, one cleanup.
    lateMessage?.({ data: { ok: true, matches: [] } } as MessageEvent);
    lateError?.({} as ErrorEvent);
    lateMessageError?.({} as MessageEvent);
    await vi.advanceTimersByTimeAsync(100);
    expect(rejections).toBe(1);
    expect(worker.terminate).toHaveBeenCalledOnce();
    expect(worker.onmessage).toBeNull();
    expect(worker.onerror).toBeNull();
    expect(worker.onmessageerror).toBeNull();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("cleans up exactly once when the worker terminates unexpectedly", async () => {
    vi.useFakeTimers();
    const worker = mockWorker();
    const pending = runRegexInWorker("\\d+", "a12b", "g", 25, () => worker);
    const assertion = expect(pending).rejects.toThrow(/could not read the regex result/);
    // The worker dies unexpectedly (unreadable result) before the deadline.
    await vi.advanceTimersByTimeAsync(10);
    worker.onmessageerror?.({} as MessageEvent);
    // The deadline and any late events must not fire cleanup a second time.
    await vi.advanceTimersByTimeAsync(100);
    await assertion;
    expect(worker.terminate).toHaveBeenCalledOnce();
    expect(worker.onmessage).toBeNull();
    expect(worker.onerror).toBeNull();
    expect(worker.onmessageerror).toBeNull();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("returns worker matches and terminates the worker", async () => {
    const worker = mockWorker();
    const pending = runRegexInWorker("\\d+", "a12b", "g", 100, () => worker);
    worker.onmessage?.({ data: { ok: true, matches: [{ value: "12", index: 1 }] } } as MessageEvent);
    await expect(pending).resolves.toEqual([{ value: "12", index: 1 }]);
    expect(worker.terminate).toHaveBeenCalledOnce();
  });

  it("removes handlers and timers exactly once on the successful worker-response path", async () => {
    vi.useFakeTimers();
    const worker = mockWorker();
    const pending = runRegexInWorker("\\d+", "a12b", "g", 25, () => worker);
    let resolutions = 0;
    const tracked = pending.then((matches) => { resolutions++; return matches; });
    // The worker answers before the deadline.
    await vi.advanceTimersByTimeAsync(10);
    const lateMessage = worker.onmessage;
    const lateError = worker.onerror;
    worker.onmessage?.({ data: { ok: true, matches: [{ value: "12", index: 1 }] } } as MessageEvent);
    await expect(tracked).resolves.toEqual([{ value: "12", index: 1 }]);
    expect(resolutions).toBe(1);
    expect(worker.terminate).toHaveBeenCalledOnce();
    expect(worker.onmessage).toBeNull();
    expect(worker.onerror).toBeNull();
    expect(worker.onmessageerror).toBeNull();
    // The pending deadline was cleared; no timers remain.
    expect(vi.getTimerCount()).toBe(0);
    // Late events after success are ignored: no second cleanup, no extra resolution.
    lateMessage?.({ data: { ok: true, matches: [{ value: "99", index: 0 }] } } as MessageEvent);
    lateError?.({} as ErrorEvent);
    await vi.advanceTimersByTimeAsync(100);
    expect(resolutions).toBe(1);
    expect(worker.terminate).toHaveBeenCalledOnce();
    expect(vi.getTimerCount()).toBe(0);
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
